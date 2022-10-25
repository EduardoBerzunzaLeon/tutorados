class CurrentSubjectsService {

    constructor({
        createAppError,
        FailedSubjectsRepository
    }) {
        this.createAppError = createAppError;
        this.failedSubjectsRepository = FailedSubjectsRepository;
    }


    async loadData(schoolYear, file) {

        const decodedFailure = Buffer.from(failureSubjects.buffer, 'base64').toString();

    }


    async delete(schoolYear) {
        await this.failedSubjectsRepository.deleteMany({
            'schoolYear.period': schoolYear.period,
            'schoolYear.phase': schoolYear.phase
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

}