const { ObjectId } = require('mongoose').Types;

class SubjectHistoryService  {

    constructor({ 
        SubjectHistoryRepository,
        StudentRepository,
        createAppError,
        features,
        SubjectRepository
     }) {
        this.subjectHistoryRepository = SubjectHistoryRepository;
        this.studentRepository = StudentRepository;
        this.subjectRepository = SubjectRepository;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
    }

    async validBeforeSavePhase(id, phaseStatus, semester, fieldToFind ) {
        if(!ObjectId.isValid(id)) {
            throw this.createAppError('La fase no es valida, favor de verificarla', 400);
        }
        
        if( !phaseStatus || !semester  ) {
            throw this.createAppError('Todos los campos son obligatorios', 400);
        }

        const idMongo = ObjectId(id);

        const history = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { [ fieldToFind ]: idMongo } },
            {
                $lookup: {
                    from: 'students',
                    foreignField: "user",
                    localField: "student",
                    as: "student"
                },
            },
            { $unwind: "$student" },
        ]);

        if(!history || history.length === 0) {
            throw this.createAppError('No se encontro la materia para agregar fase', 400);
        }
    
        const [ subject ] = history;
    
        if( subject?.student?.currentSemester  < semester) {
            throw this.createAppError('No se puede cargar una materia en un semester mayor al cursado actual del alumno', 400);
        }

        return { phase: subject.phase , idMongo };
    }

    async findByUserId (userId) {

        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('Estudiante no valido', 400);
        }
        
        const studentData = await this.studentRepository.findOne({ user: userId }, {
            path: 'user', select: 'avatar name gender email '
        }).lean();
        
        if(this.isEmpty(studentData)) {
            throw this.createAppError('Estudiante no encontrado', 404);
        }

        const { currentSemester } = studentData;

        const subjects = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { student: ObjectId(userId) } },
            { $addFields: { lastPhase: { $last: '$phase'} } },
            { $match: { "lastPhase.semester": currentSemester } },
            {
                $lookup: {
                    from: 'subjects',
                    foreignField: "_id",
                    localField: "subject",
                    pipeline: [
                       { $project: { name: 1, deprecated: 1, id: 1 } }
                    ],
                    as: "subject"
                },
            },
            { $unwind: "$subject" },
            {
                $project: {
                    _id: 1,
                    subject: "$subject",
                    lastPhase: "$lastPhase",
                    step: { $size: "$phase" }
                }
            }
        ]);

        if(this.isEmpty(subjects)) {
            throw this.createAppError('Materias del semestre no encontradas', 404);
        }

        studentData.subjectHistory = subjects;

        // console.log(subjects)
        return studentData;
    }

    async findHistoryByUserId(userId) {

        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('Estudiante no valido', 400);
        }

        const subjects = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { student: ObjectId(userId) } },
            { $addFields: {
                "phasesWithPosition": {
                    $map: {
                        input: "$phase",
                        as: "specificPhase",
                        in: {
                            'position': { "$indexOfArray": [ "$phase._id",   "$$specificPhase._id" ] },
                            'phaseStatus': "$$specificPhase.phaseStatus",
                            '_id': "$$specificPhase._id",
                            'semester': '$$specificPhase.semester'
                        }
                    }
                }
            }},
            {
                $lookup: {
                    from: 'subjects',
                    foreignField: "_id",
                    localField: "subject",
                    pipeline: [
                       { $project: { name: 1, deprecated: 1, id: 1 } }
                    ],
                    as: "subject"
                },
            },
            { $unwind: "$subject" },
            { $unwind: "$phasesWithPosition" },
            {
                $group : { 
                    _id : "$phasesWithPosition.semester",
                    subjects: { $push: { 
                        subject: "$subject",
                        phaseStatus: "$phasesWithPosition.phaseStatus",
                        step: { $add: [ "$phasesWithPosition.position", 1 ] }
                    }}
                }
            },
           
        ]);

        if(this.isEmpty(subjects)) {
            throw this.createAppError('Materias del semestre no encontradas', 404);
        }

        return subjects;
    }

    async findUnstudySubjects(userId) {

        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('Estudiante no valido', 400);
        }

        const subjects = await this.subjectRepository.entity.aggregate([
            { $match: { deprecated: false } },
            {
                $lookup: {
                    from: 'subjecthistories',
                    foreignField: "subject",
                    localField: "_id",
                    pipeline: [
                        { $match:  { student: ObjectId(userId) } }
                    ],
                    as: "history"
                },
            },
            { $match: { history: { $eq: [] }} },
            { $sort: { semester: 1 } }
        ]);

        if(this.isEmpty(subjects)) {
            throw this.createAppError('Materias Sin cursar del alumno no encontradas', 404);
        }

        return subjects;
   }

    async create({ userId, subjectId, phaseStatus, semester }) {

        if ( !userId || !subjectId || !phaseStatus || !semester ) 
            throw this.createAppError('Todos los campos son obligatorios', 400);

        if(!ObjectId.isValid(userId) || !ObjectId.isValid(subjectId)) 
            throw this.createAppError('Estudiando o materia no valido', 400);
        
        const userIdMongo = ObjectId(userId);
        const subjectIdMongo = ObjectId(subjectId);
        
        const isExists = await this.subjectHistoryRepository.findOne({
            student: userIdMongo,
            subject: subjectIdMongo
        });
        
        if(isExists) {
            throw this.createAppError('El alumno ya tiene asiganada la materia', 400);
        }

        const subjectCreated = await this.subjectHistoryRepository.create({
            student: userIdMongo,
            subject: subjectIdMongo,
            phase: [{
                phaseStatus,
                semester,
            }],
        });
        
        if(!subjectCreated) 
            throw this.createAppError('No se pudo concluir su registro', 500);

        return subjectCreated;    
    }

    async addNewPhase({ docId, phaseStatus, date, semester }) {
        
        const { phase, idMongo } = await this.validBeforeSavePhase(docId, phaseStatus, semester, '_id' );

        if(phase.length === 3) {
            throw this.createAppError('El alumno ya alcanzo su tercer intento con la materia', 400);
        }
        
        const lastPhase = phase[phase.length - 1];
        
        if( lastPhase?.semester >= semester ) {
            throw this.createAppError('El semestre tiene que ser mayor al ultimo semestre cursado de la materia', 400);
        }
        
        const newPhase = { phaseStatus, date, semester };

        const phaseAdded = await this.subjectHistoryRepository.updateOne(
            { _id: idMongo },
            { $push: { newPhase }
        });

        const { nModified } = phaseAdded;

        if(nModified <= 0) 
            throw this.createAppError('No se pudo agregar la materia al alumno', 500);
        
    }

    async updatePhase({ phaseId, phaseStatus, date, semester }) {
        
        const { phase, idMongo } = await this.validBeforeSavePhase(phaseId, phaseStatus, semester, 'phase._id' );

        const { length } = phase;
        
        if( length > 1 && phase[length - 2]?.semester >= semester ) {
            throw this.createAppError('El semestre tiene que ser mayor al ultimo semestre cursado de la materia', 400);
        }

        const phaseUpdated = await this.subjectHistoryRepository.updateOne(
            { "phase._id": idMongo },
            { "$set": { 
                "phase.$.phaseStatus": phaseStatus,
                "phase.$.date": date ?? Date.now(),
                "phase.$.semester": semester
            }}
        );
        
        if(phaseUpdated.n <= 0) {
            throw this.createAppError('No se pudo actualizar la fase', 500);
        }

    }
        
    async deletePhase( phaseId ) {

        if(!ObjectId.isValid(phaseId)) {
            throw this.createAppError('La fase no es valida, favor de verificarla', 400);
        }

        const phaseIdMongo = ObjectId(phaseId);

        const phaseDeleted = await this.subjectHistoryRepository.updateOne(
            { "phase._id": phaseIdMongo  },
            { $pull: { "phase": { "_id": phaseIdMongo }}},
        );

        if(phaseDeleted.n <= 0) 
            throw this.createAppError('No se pudo eliminar el intento de la materia', 500);

    }

}

module.exports = SubjectHistoryService;