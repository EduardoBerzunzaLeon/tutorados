
class SubjectsForSchoolYearService {
    constructor({
        FailedSubjectsRepository,
        CurrentSubjectsRepository,
        SubjectHistoryService,
        createAppError,
        features,
    }) {
        this.failedSubjectsRepository = FailedSubjectsRepository;
        this.currentSubjectsRepository = CurrentSubjectsRepository;
        this.subjectHistoryService = SubjectHistoryService;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
    }

    async loadData(files, currentSchoolYear) {

        if(files.length != 2) {
            throw this.createAppError('El archivo de bajas y nueva carga academica son requeridos', 500);
        }

        const [ failureSubjects, newSubjectsTaked ] = files;
        const decodedFailure = Buffer.from(failureSubjects.buffer, 'base64').toString();
        const decodedNew = Buffer.from(newSubjectsTaked.buffer, 'base64').toString();

        try {
            
            const { oldShoolYear, newSchoolYear } = this.getCorrectSchoolYear(currentSchoolYear);        
            
            await this.deleteSubjects(oldShoolYear, newSchoolYear);
            
            const failedSubjects = this.convertStringToObject(decodedFailure, oldShoolYear);
            const currentSubjects = this.convertStringToObject(decodedNew, newSchoolYear);
            
            const [ failedSaved, currentSaved ] = await Promise.all([
                this.failedSubjectsRepository.create(failedSubjects, { validateBeforeSave: false }),
                this.currentSubjectsRepository.create(currentSubjects, { validateBeforeSave: false })
            ]);
            
            
            if(failedSaved.length !== failedSubjects.length || currentSaved.length !== currentSubjects.length ) {
                await this.deleteSubjects(oldShoolYear, newSchoolYear);
                throw this.createAppError('No se pudo guardar todos los registros, favor de realizar el proceso de nuevo.', 500);
            }
    
            await this.findFailedSubjectsError(oldShoolYear);
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
            oldShoolYear: {
                period,
                phase: 1
            },
            newSchoolYear: {
                period,
                phase: 2
            }
        };

        if(secondPhase.status === 'generado') {
            schoolYear.oldShoolYear.phase = 2;
            schoolYear.newSchoolYear.phase = 1;
            schoolYear.newSchoolYear.period = { start: period.end, end: period.end + 1 };
        }

        return schoolYear;
    }

    convertStringToObject(str, schoolYear) {

        const arrayOfRows = str.split('\r\n');

        return arrayOfRows.map(row => {

            const columns = row.split(',');
            if(columns.length > 2) {
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
             //  Search for subjects don't exist
            const subjects = await this.failedSubjectsRepository.entity.aggregate([
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
                {
                    $group:{ _id: null, ids: { $push: "$_id" }}
                },
                {
                    $project:{ ids: true , _id: false }
                }
             ]);

             
             if(subjects.length > 0 ) {

                 const [{ ids }] = subjects;

                 await this.failedSubjectsRepository.updateMany(
                    { _id: { "$in": ids} },
                    { error: 'Materia no encontrada' }
                  );
             }
 
    
            const students = await this.failedSubjectsRepository.entity.aggregate([
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
                {
                    $group:{ _id: null, ids: { $push: "$_id" }}
                },
                {
                    $project:{ ids: true , _id: false }
                }
                ]);

                if(students.length > 0 ) {

                    const [{ ids }] = students;
   
                    await this.failedSubjectsRepository.updateMany(
                       { _id: { "$in": ids} },
                       { error: 'Alumno no encontrado' }
                     );
                }

            const currentSubjects = await this.failedSubjectsRepository.entity.aggregate([
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
                { $unwind: '$subjects' },
                {
                    $lookup: {
                        from: 'subjecthistories',
                        foreignField: 'student',
                        localField: 'student',
                        pipiline: [{ $match: { subject: '$subject' } }],
                        as: 'subjectHistory'
                    }
                },
                { $unwind:  '$subjectHistory', preserveNullAndEmptyArrays: true },
                {
                    $addFields: { 
                        phase: {
                            $cond: {
                                $if: {
                                    $and: [
                                        { isArray: "subjectHistory" },
                                        { '$subjectHistory': { $ne: [] }}  
                                    ]
                                },
                                then: { $last: 'subjectHistory.phase' },
                                else: undefined
                            }
                        }
                    }
                },
                {
                    $match: {
                        '$phase': { $exists: true },
                        '$phase.phaseStatus': 'cursando' 
                    }
                },
                {
                    $group:{ _id: null, ids: { $push: "$_id" }}
                },
                {
                    $project:{ ids: true , _id: false }
                }
                ]);

                if(currentSubjects.length > 0 ) {

                    const [{ ids }] = currentSubjects;
   
                    await this.failedSubjectsRepository.updateMany(
                       { _id: { "$nin": ids} },
                       { error: 'Materia no existe en su carga actual' }
                     );
                }

        } catch (error) {
            console.log(error);
        }
    }

    async findCurrentSubjectsError( newSchoolYear ) {

        try {
            
            const subjects = await this.currentSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': newSchoolYear.period,
                        'schoolYear.phase': newSchoolYear.phase
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

             
             if(subjects.length > 0 ) {

                 const [{ ids }] = subjects;

                 await this.currentSubjectsRepository.updateMany(
                    { _id: { "$in": ids} },
                    { error: 'Materia no encontrada' }
                  );
             }
            
             const students = await this.currentSubjectsRepository.entity.aggregate([
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
                {
                    $group:{ _id: null, ids: { $push: "$_id" }}
                },
                {
                    $project:{ ids: true , _id: false }
                }
                ]);

                if(students.length > 0 ) {

                    const [{ ids }] = students;
   
                    await this.failedSubjectsRepository.updateMany(
                       { _id: { "$in": ids} },
                       { error: 'Alumno no encontrado' }
                     );
                }


            
            const currentSubjects = await this.currentSubjectsRepository.entity.aggregate([
                {
                    $match: {
                        'schoolYear.period': oldSchoolYear.period,
                        'schoolYear.phase': oldSchoolYear.phase,
                        'error': { $exists: false }
                    },
                },
                { 
                    $lookup: {
                        'from': 'subjecthitories',
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
                { $unwind: '$subjects' },
                {
                    $lookup: {
                        from: 'subjecthistories',
                        foreignField: 'student',
                        localField: 'student',
                        pipiline: [{ $match: { subject: '$subject' } }],
                        as: 'subjectHistory'
                    }
                },
                { $unwind:  '$subjectHistory', preserveNullAndEmptyArrays: true },
                {
                    $addFields: { 
                        phase: {
                            $cond: {
                                $if: {
                                    $and: [
                                        { isArray: "subjectHistory" },
                                        { '$subjectHistory': { $ne: [] }}  
                                    ]
                                },
                                then: { $last: 'subjectHistory.phase' },
                                else: undefined
                            }
                        }
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                '$phase': { $exists: true },
                                '$subjectHistory': { $size: 3 } 
                            },
                            {
                                '$phase': { $exists: true },
                                '$phase.phaseStatus': 'aprobado'
                            }
                        ]
                    }
                },
                {
                    $group:{ _id: null, ids: { $push: "$_id" }}
                },
                {
                    $project:{ ids: true , _id: false }
                }
                ]);
    
            if(currentSubjects.length > 0 ) {

                const [{ ids }] = currentSubjects;

                await this.failedSubjectsRepository.updateMany(
                    { _id: { "$in": ids} },
                    { error: 'Materia no valida' }
                    );
            }    
        } catch (error) {
            console.log(error);
        }
    }

    async failSubjects( schoolYear ) {
        const subjects = await this.failedSubjectsRepository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': schoolYear.period,
                    'schoolYear.phase': schoolYear.phase,
                    'error': { $exitst: false }
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
            { $unwind: '$subjects' },
            {
                $lookup: {
                    from: 'subjecthistories',
                    foreignField: 'student',
                    localField: 'student',
                    pipiline: [{ $match: { subject: '$subject' } }],
                    as: 'subjectHistory'
                }
            },
            { $unwind:  '$subjectHistory' },
            { $addFields: { phase: { $last: 'subjectHistory.phase' } }},
        ]);

        if(!subjects) {
            throw this.createAppError('No se encontraron materias para reprobar', 404);
        }

        const { phase, student } = subjects;
        const dataToUpdate = {
            phaseId: phase._id,
            phaseStatus: 'reprobado',
            semester: student.currentSemester,
            date: Date.now()
        }

        await this.subjectHistoryService.updatePhase(dataToUpdate);  
    }

    async chargeNewCurrentSubjects(schoolYear) {
        const subjects = await this.currentSubjectsRepository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': schoolYear.period,
                    'schoolYear.phase': schoolYear.phase,
                    'error': { $exitst: false }
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
            { $unwind: '$subjects' },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'student._id',
                    as: 'user'
                }
            },
            { $unwind:  '$user' },
        ]);

        if(!subjects) {
            throw this.createAppError('No se encontraron materias para reprobar', 404);
        }

        const { subject, student, user } = subjects;
        const dataToUpdate = {
            userId: user._id, 
            subjectId: subject._id, 
            phaseStatus: 'cursando', 
            semester: student.currentSemester,
        }

        await this.subjectHistoryService.create(dataToUpdate); 
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