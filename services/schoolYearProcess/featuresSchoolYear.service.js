
class FeaturesSchoolYear {
    constructor({
        createAppError,
        features,
    }) {
        this.createAppError = createAppError;
        this.decodeFile = features.decodeFileToString;
    }

   async loadData({ schoolYear, file, service }) {
        const decodedFile = service.decodeFile(file);

        await service.delete(schoolYear);

        const dataConverted = this.convertStringToObject({
            str: decodedFile, 
            schoolYear: schoolYear,
            columnSize: 2
        });

        const dataSaved = await service.create(dataConverted);

        if(dataSaved.length !== dataConverted.length) {
            await service.delete(schoolYear);
            throw this.createAppError('No se pudo guardar todos los registros, favor de realizar el proceso de nuevo.', 400);
        }

        const hasError = await service.findAndUpdateErrors(schoolYear);

        if(hasError) {
            throw this.createAppError('Uno de los archivos tiene un error, favor de verificarlo.', 400);
        }
   }

    async updateInvalidSubjects({ period, phase, repository }) {

        let hasError = false;
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
            hasError = true;

            const [{ ids }] = invalidSubjects;

            await repository.updateMany(
                { _id: { "$in": ids} },
                { error: 'Materia no encontrada' }
            );
         }

         return hasError;
    }

    async updateInvalidStudents({ period, phase, repository }) {
        
        let hasError = false;

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
            hasError = true;
            const [{ ids }] = invalidStudents;
        
            await repository.updateMany(
                { _id: { "$in": ids} },
                { error: 'Alumno no encontrado' }
            );
        }

        return hasError;
    }

    async updateInvalidCurrentSubjects({ 
        period, 
        phase, 
        repository, 
        matchClouse,
        errorMessage
    }) {

        let hasError = false;

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
            hasError = false;
            const [{ ids }] = invalidCurrentSubjects;
        
            await repository.updateMany(
                { _id: { "$in": ids} },
                { error: errorMessage }
            );
        }

        return hasError;
    }

    getCorrectSchoolYear({ period, secondPhase }) {

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


    getInitialAggregate({ period, phase }) {
        return [
            {
                $match: {
                    'schoolYear.period': period,
                    'schoolYear.phase': phase,
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
            { $unwind: '$subject' }
        ]
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
}

module.exports = FeaturesSchoolYear;