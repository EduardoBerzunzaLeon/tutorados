
class SubjectsForSchoolYearService {
    constructor({
        FailedSubjectsRepository,
        CurrentSubjectsRepository,
        SubjectHistoryService,
        StudentService,
        createAppError,
        features,
    }) {
        this.failedSubjectsRepository = FailedSubjectsRepository;
        this.currentSubjectsRepository = CurrentSubjectsRepository;
        this.subjectHistoryService = SubjectHistoryService;
        this.studentService = StudentService;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
        this.decodeFile = features.decodeFileToString;
    }

    async loadData(files, currentSchoolYear) {

        if(files.length != 2) {
            throw this.createAppError('El archivo de bajas y nueva carga academica son requeridos', 500);
        }

        const [ failureSubjects, newSubjectsTaked ] = files;
        const decodedFailure = this.decodeFile(failureSubjects);
        const decodedNew = this.decodeFile(newSubjectsTaked);

        try {
            
            const { oldSchoolYear, newSchoolYear } = this.getCorrectSchoolYear(currentSchoolYear);        
            
            await this.deleteSubjects(oldSchoolYear, newSchoolYear);
        
            const failedSubjects = this.convertStringToObject({
                str: decodedFailure, 
                schoolYear: oldSchoolYear,
                columnSize: 2
            });

            const currentSubjects = this.convertStringToObject({
                str: decodedNew, 
                schoolYear: newSchoolYear,
                columnSize: 2
            });
            
            const [ failedSaved, currentSaved ] = await Promise.all([
                this.failedSubjectsRepository.create(failedSubjects),
                this.currentSubjectsRepository.create(currentSubjects)
            ]);
            
            if(failedSaved.length !== failedSubjects.length || currentSaved.length !== currentSubjects.length ) {
                await this.deleteSubjects(oldSchoolYear, newSchoolYear);
                throw this.createAppError('No se pudo guardar todos los registros, favor de realizar el proceso de nuevo.', 500);
            }
    
            await Promise.all([
                this.findFailedSubjectsError(oldSchoolYear),
                this.findCurrentSubjectsError(newSchoolYear)
            ]);

            await this.studentService.increaseSemester();

            await Promise.all([
                this.failSubjects(oldSchoolYear),
                this.addNewCurrentSubjects(newSchoolYear)
            ]);
            
            return {
                ok: true,
                message: 'data loaded'
            }

        } catch (error) {
            throw this.createAppError('Ocurrio un error, favor de intentarlo de nuevo', 500);
        }

    }

    async deleteSubjects(oldSchoolYear, newSchoolYear) {
        
        await Promise.all( [ 
            this.failedSubjectsRepository.deleteMany({
                'schoolYear.period': oldSchoolYear.period,
                'schoolYear.phase': oldSchoolYear.phase
            }),
            this.currentSubjectsRepository.deleteMany({
                'schoolYear.period': newSchoolYear.period,
                'schoolYear.phase': newSchoolYear.phase
            }),
        ]);

    }

    getCorrectSchoolYear(currentSchoolYear) {

        const { period, secondPhase } = currentSchoolYear;
        const schoolYear = {
            oldSchoolYear: {
                period,
                phase: 1
            },
            newSchoolYear: {
                period,
                phase: 2
            }
        };

        if(secondPhase.status === 'generado') {
            schoolYear.oldSchoolYear.phase = 2;
            schoolYear.newSchoolYear.phase = 1;
            schoolYear.newSchoolYear.period = { start: period.end, end: period.end + 1 };
        }

        return schoolYear;
    }

    convertStringToObject({ str, schoolYear, columnSize }) {

        const arrayOfRows = str.split('\r\n');

        return arrayOfRows.map(row => {

            const columns = row.split(',');
            if(columns.length > columnSize) {
                throw this.createAppError('El archivo cargado no tiene la estructura requerida', 500);
            }

            const [ enrollment, subject ] = columns;
            return  {
                schoolYear,
                enrollment,
                subject,
            }

        });

    }

    async findFailedSubjectsError( oldSchoolYear ) {

        try {

            const invalidSubjects = await this.failedSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': oldSchoolYear.period,
                        'schoolYear.phase': oldSchoolYear.phase
                    },
                },
                { 
                    $lookup: {
                        'from': 'subjects',
                        'foreignField': 'name',
                        'localField': 'subject',
                        'as': 'subject'
                    }
                },
                { $match: { "subject": { $eq: [] } }},
                { $group:{ _id: null, ids: { $push: "$_id" }} },
                { $project:{ ids: true , _id: false } }
             ]);
             
             if(invalidSubjects.length > 0 ) {

                 const [{ ids }] = invalidSubjects;

                 await this.failedSubjectsRepository.updateMany(
                    { _id: { "$in": ids} },
                    { error: 'Materia no encontrada' }
                  );
             }
    
            const invalidStudents = await this.failedSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': oldSchoolYear.period,
                        'schoolYear.phase': oldSchoolYear.phase
                    },
                },
                { 
                    $lookup: {
                        'from': 'students',
                        'foreignField': 'enrollment',
                        'localField': 'enrollment',
                        'as': 'student'
                    }
                },
                { $match: { "student": { $eq: [] } }},
                { $group:{ _id: null, ids: { $push: "$_id" }} },
                { $project:{ ids: true , _id: false } }
            ]);

            if(invalidStudents.length > 0 ) {
                const [{ ids }] = invalidStudents;
                await this.failedSubjectsRepository.updateMany(
                    { _id: { "$in": ids} },
                    { error: 'Alumno no encontrado' }
                    );
            }

            const invalidCurrentSubjects = await this.failedSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': oldSchoolYear.period,
                        'schoolYear.phase': oldSchoolYear.phase,
                        'error': { $exists: false }
                    },
                },
                { 
                    $lookup: {
                        'from': 'students',
                        'foreignField': 'enrollment',
                        'localField': 'enrollment',
                        'as': 'student'
                    }
                },
                { $unwind: '$student' },
                { 
                    $lookup: {
                        'from': 'subjects',
                        'foreignField': 'name',
                        'localField': 'subject',
                        'as': 'subject'
                    }
                },
                { $unwind: '$subject' },
                {
                    $lookup: {
                        from: "subjecthistories",
                        let: {
                           subjectHis: "$subject._id",
                           studentHis: "$student.user"
                        },
                        pipeline: [
                           {
                              $match: {
                                 $expr: {
                                    $and: [
                                       { $eq: [ "$subject", "$$subjectHis" ] },
                                       { $eq: [ "$student", "$$studentHis" ] }
                                    ]
                                 }
                              }
                           }
                        ],
                        as: "subjectHistory"
                     }
                },
                { $unwind: { path: "$subjectHistory", preserveNullAndEmptyArrays: true }},
                {
                    $addFields: { 
                        phase: {
                            $cond: {
                                if: {
                                    $and: [
                                        { isArray: "$subjectHistory" },
                                        { $ne: [ '$subjectHistory', [] ]}  
                                    ]
                                },
                                then: { $last: '$subjectHistory.phase' },
                                else: undefined
                            }
                        }
                    }
                },
                {
                    $match: {
                        'phase': { $exists: true },
                        'phase.phaseStatus': { $ne: 'cursando' }
                    }
                },
                { $group:{ _id: null, ids: { $push: "$_id" }} },
                { $project:{ ids: true , _id: false } }
            ]);

            if(invalidCurrentSubjects.length > 0 ) {
                const [{ ids }] = invalidCurrentSubjects;

                await this.failedSubjectsRepository.updateMany(
                    { _id: { "$in": ids } },
                    { error: 'Materia no existe en su carga actual' }
                );
            }

        } catch (error) {
            console.log(error);
        }
    }


    async updateInvalidSubjects({ period, phase, repository }) {

        const invalidSubjects = await repository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': period,
                    'schoolYear.phase': phase
                },
            },
            { 
                $lookup: {
                    'from': 'subjects',
                    'foreignField': 'name',
                    'localField': 'subject',
                    'as': 'subject'
                }
            },
            { $match: { "subject": { $eq: [] } }},
            {
                $group:{ _id: null, ids: { $push: "$_id" }}
            },
            {
                $project:{ ids: true , _id: false }
            }
         ]);

         
         if(invalidSubjects.length > 0 ) {

             const [{ ids }] = invalidSubjects;

             await repository.updateMany(
                { _id: { "$in": ids} },
                { error: 'Materia no encontrada' }
              );
         }

    }

    async updateInvalidStudents({ period, phase, repository }) {

        const invalidStudents = await repository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': period,
                    'schoolYear.phase': phase
                },
            },
            { 
                $lookup: {
                    'from': 'students',
                    'foreignField': 'enrollment',
                    'localField': 'enrollment',
                    'as': 'student'
                }
            },
            { $match: { "student": { $eq: [] } }},
            {
                $group:{ _id: null, ids: { $push: "$_id" }}
            },
            {
                $project:{ ids: true , _id: false }
            }
        ]);
        
        if(invalidStudents.length > 0 ) {
        
            const [{ ids }] = invalidStudents;
        
            await repository.updateMany(
                { _id: { "$in": ids} },
                { error: 'Alumno no encontrado' }
            );
        }

    }

    async updateInvalidCurrentSubjects({ 
        period, 
        phase, 
        repository, 
        matchClouse,
        errorMessage
    }) {

        const invalidCurrentSubjects = await repository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': period,
                    'schoolYear.phase':phase,
                    'error': { $exists: false }
                },
            },
            { 
                $lookup: {
                    'from': 'students',
                    'foreignField': 'enrollment',
                    'localField': 'enrollment',
                    'as': 'student'
                }
            },
            { $unwind: '$student' },
            { 
                $lookup: {
                    'from': 'subjects',
                    'foreignField': 'name',
                    'localField': 'subject',
                    'as': 'subject'
                }
            },
            { $unwind: '$subject' },
            {
                $lookup: {
                    from: "subjecthistories",
                    let: {
                        subjectHis: "$subject._id",
                        studentHis: "$student.user"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                $and: [
                                    { $eq: [ "$subject", "$$subjectHis" ] },
                                    { $eq: [ "$student", "$$studentHis" ] }
                                ]
                                }
                            }
                        }
                    ],
                    as: "subjectHistory"
                    }
            },
            { $unwind: { path: "$subjectHistory", preserveNullAndEmptyArrays: true }},
            {
                $addFields: { 
                    phase: {
                        $cond: {
                            if: {
                                $and: [
                                    { isArray: "$subjectHistory" },
                                    { $ne: [ '$subjectHistory', [] ]}  
                                ]
                            },
                            then: { $last: '$subjectHistory.phase' },
                            else: undefined
                        }
                    }
                }
            },
            { $match: matchClouse },
            { $group:{ _id: null, ids: { $push: "$_id" }} },
            { $project:{ ids: true , _id: false } }
        ]);
        
        if(invalidCurrentSubjects.length > 0 ) {
            const [{ ids }] = invalidCurrentSubjects;
        
            await this.currentSubjectsRepository.updateMany(
                { _id: { "$in": ids} },
                { error: errorMessage }
            );
        }

    }

    async findCurrentSubjectsError( newSchoolYear ) {

        try {

            const { period, phase } = newSchoolYear;
            
            await updateInvalidSubjects({
                period,
                phase,
                repository: this.currentSubjectsRepository
            });
            
            await updateInvalidStudents({
                period,
                phase,
                repository: this.currentSubjectsRepository
            });

            await updateInvalidCurrentSubjects({ 
                period, 
                phase, 
                repository: this.currentSubjectsRepository, 
                matchClouse: {
                    $or: [
                        {
                            'phase': { $exists: true },
                            'subjectHistory': { $size: 3 } 
                        },
                        {
                            'phase': { $exists: true },
                            'phase.phaseStatus': 'aprobado'
                        }
                    ]
                },
                errorMessage: 'Materia no valida'
            });
            

            // const invalidCurrentSubjects = await this.currentSubjectsRepository.entity.aggregate([
            //     {
            //         $match: {
            //             'schoolYear.period': newSchoolYear.period,
            //             'schoolYear.phase': newSchoolYear.phase,
            //             'error': { $exists: false }
            //         },
            //     },
            //     { 
            //         $lookup: {
            //             'from': 'students',
            //             'foreignField': 'enrollment',
            //             'localField': 'enrollment',
            //             'as': 'student'
            //         }
            //     },
            //     { $unwind: '$student' },
            //     { 
            //         $lookup: {
            //             'from': 'subjects',
            //             'foreignField': 'name',
            //             'localField': 'subject',
            //             'as': 'subject'
            //         }
            //     },
            //     { $unwind: '$subject' },
            //     {
            //         $lookup: {
            //             from: "subjecthistories",
            //             let: {
            //                 subjectHis: "$subject._id",
            //                 studentHis: "$student.user"
            //             },
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: {
            //                         $and: [
            //                             { $eq: [ "$subject", "$$subjectHis" ] },
            //                             { $eq: [ "$student", "$$studentHis" ] }
            //                         ]
            //                         }
            //                     }
            //                 }
            //             ],
            //             as: "subjectHistory"
            //             }
            //     },
            //     { $unwind: { path: "$subjectHistory", preserveNullAndEmptyArrays: true }},
            //     {
            //         $addFields: { 
            //             phase: {
            //                 $cond: {
            //                     if: {
            //                         $and: [
            //                             { isArray: "$subjectHistory" },
            //                             { $ne: [ '$subjectHistory', [] ]}  
            //                         ]
            //                     },
            //                     then: { $last: '$subjectHistory.phase' },
            //                     else: undefined
            //                 }
            //             }
            //         }
            //     },
            //     {
            //         $match: {
            //             $or: [
            //                 {
            //                     'phase': { $exists: true },
            //                     'subjectHistory': { $size: 3 } 
            //                 },
            //                 {
            //                     'phase': { $exists: true },
            //                     'phase.phaseStatus': 'aprobado'
            //                 }
            //             ]
            //         }
            //     },
            //     { $group:{ _id: null, ids: { $push: "$_id" }} },
            //     { $project:{ ids: true , _id: false } }
            // ]);

            // if(invalidCurrentSubjects.length > 0 ) {
            //     const [{ ids }] = invalidCurrentSubjects;

            //     await this.currentSubjectsRepository.updateMany(
            //         { _id: { "$in": ids} },
            //         { error: 'Materia no valida' }
            //     );
            // }

        } catch (error) {
            console.log(error);
        }
    }

    async failSubjects( schoolYear ) {

        try {
            const subjects = await this.failedSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': schoolYear.period,
                        'schoolYear.phase': schoolYear.phase,
                        'error': { $exists: false }
                    },
                },
                { 
                    $lookup: {
                        'from': 'students',
                        'foreignField': 'enrollment',
                        'localField': 'enrollment',
                        'as': 'student'
                    }
                },
                { $unwind: '$student' },
                { 
                    $lookup: {
                        'from': 'subjects',
                        'foreignField': 'name',
                        'localField': 'subject',
                        'as': 'subject'
                    }
                },
                { $unwind: '$subject' },
                {
                    $lookup: {
                        from: "subjecthistories",
                        let: {
                           subjectHis: "$subject._id",
                           studentHis: "$student.user"
                        },
                        pipeline: [
                           {
                              $match: {
                                 $expr: {
                                    $and: [
                                       { $eq: [ "$subject", "$$subjectHis" ] },
                                       { $eq: [ "$student", "$$studentHis" ] }
                                    ]
                                 }
                              }
                           }
                        ],
                        as: "subjectHistory"
                     }
                },
                { $unwind: '$subjectHistory' },
                { $addFields: { phase: { $last: '$subjectHistory.phase' } }},
            ]);
    
            if(!subjects) {
                throw this.createAppError('No se encontraron materias para reprobar', 404);
            }

            const subjectsToAdd = subjects.map(({ phase, student }) => {
                
                const phaseToUpdate =  {
                    phaseId: phase._id,
                    phaseStatus: 'reprobado',
                    semester: student.currentSemester,
                    date: Date.now()
                }

                return this.subjectHistoryService.updatePhase(phaseToUpdate);
            });
            
            return await Promise.all([ subjectsToAdd ]);

        } catch (error) {
            console.log(error);
        }
    }

    async addNewCurrentSubjects(schoolYear) {

        try {

            const subjects = await this.currentSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': schoolYear.period,
                        'schoolYear.phase': schoolYear.phase,
                        'error': { $exists: false }
                    },
                },
                { 
                    $lookup: {
                        'from': 'students',
                        'foreignField': 'enrollment',
                        'localField': 'enrollment',
                        'as': 'student'
                    }
                },
                { $unwind: '$student' },
                { 
                    $lookup: {
                        'from': 'subjects',
                        'foreignField': 'name',
                        'localField': 'subject',
                        'as': 'subject'
                    }
                },
                { $unwind: '$subject' },
                {
                    $lookup: {
                        from: 'users',
                        foreignField: '_id',
                        localField: 'student.user',
                        as: 'user'
                    }
                },
                { $unwind:  '$user' },
            ]);
    
            if(!subjects) {
                throw this.createAppError('No se encontraron materias para reprobar', 404);
            }

            const subjectsToAdd = subjects.map(({ user, student, subject }) => {

                const newSubject = {
                    userId: user._id,
                    subjectId: subject._id,
                    phaseStatus: 'cursando',
                    semester: student.currentSemester
                }

                return this.subjectHistoryService.create(newSubject);
            });

            return await Promise.all(subjectsToAdd);

        } catch (error) {
            console.log(error);
        }
    }

    async getFailedSubjectsError(schoolYear) {
        const subjects = await this.failedSubjectsRepository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': schoolYear.period,
                    'schoolYear.phase': schoolYear.phase,
                    'error': { $exitst: true }
                },
            }]);

        return subjects;
    }
}

module.exports = SubjectsForSchoolYearService;