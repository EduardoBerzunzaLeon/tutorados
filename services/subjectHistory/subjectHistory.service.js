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

    async validBeforeSavePhase({ id, phaseStatus, semester, fieldToFind }) {
        if(!ObjectId.isValid(id)) {
            throw this.createAppError('La fase no es valida, favor de verificarla', 400);
        }
        
        if( !phaseStatus || !semester) {
            throw this.createAppError('Todos los campos son obligatorios', 400);
        }

        const mongoId = ObjectId(id);

        const history = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { [ fieldToFind ]: mongoId } },
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
        
        const [ { student, phase, subject } ] = history;
        
        if( student?.currentSemester < semester) {
            throw this.createAppError('No se puede cargar una materia en un semester mayor al cursado actual del alumno', 400);
        }

        return { phase , mongoId, subject, user: student.user  };
    }

    async findStudent(userId) {
        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('Estudiante no valido', 400);
        }
        
        const studentData = await this.studentRepository.findOne({ user: userId }, {
            path: 'user', select: 'avatar name gender email '
        }).lean();
        
        if(this.isEmpty(studentData)) {
            throw this.createAppError('Estudiante no encontrado', 404);
        }
        return studentData;
    }

    async findCurrentSubjects(userId) {

        const studentData = await this.findStudent(userId);
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

        studentData.subjectHistory = this.isEmpty(subjects) ? [] : subjects;
        
        console.log(studentData);
        return studentData;
    }

    async findHistory(userId) {

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
                            'semester': '$$specificPhase.semester',
                            'mode': '$$specificPhase.mode',
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
                        mode: "$phasesWithPosition.mode",
                        step: { $add: [ "$phasesWithPosition.position", 1 ] }
                    }}
                }
            },
           { $sort: { _id: 1 }}
        ]);

        return this.isEmpty(subjects) ? [] : subjects;
    }

    async findPossibleSubjectsToAdd(userId) {
        const studentData = await this.findStudent(userId);
        const { currentSemester } = studentData;

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
            { $addFields: { historyObject: { $first: '$history' }}},
            { $addFields: { 
                steps: { $cond: { if: { $isArray: "$historyObject.phase" }, then: { $size: "$historyObject.phase" }, else: 0 } },
                lastPhase: { $last: '$historyObject.phase' }
            }},
            {
                $match: {
                    $or: [
                        { 'history': { $eq: [] } },
                        {
                            'steps': { $ne: 3 },
                            "lastPhase.phaseStatus": { $ne: 'aprobado' },
                            'lastPhase.semester': { $lt: currentSemester }
                        }
                    ]
                     
                }
            }
        ]);


        if(this.isEmpty(subjects)) {
            throw this.createAppError('Materias para asignar del alumno no encontradas', 404);
        }

        const ids = subjects.map(({_id}) => _id.toString());

        const validSubjects = subjects.reduce((acc, current) => {
            if(current.requiredSubjects.some( r => ids.includes(r.toString()))) return acc;
            acc.push(current);
            return acc;
        }, []);

        return validSubjects;
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

   async assingLastChance(userId, subject) {

    const { phase } = await this.subjectHistoryRepository.findOne({ 
            student: userId,
            subject
         });

         
    if(phase.length === 3 && phase[2].phaseStatus !== 'aprobado') {
        return await this.studentRepository.updateOne({ user: userId }, { atRisk: 'ultimo intento' });            
        // const[ , , { phaseStatus }] = phase;
        // NOTE: This is a possible feature that the student automatically set his status history to 'baja'
        // if(phaseStatus === 'cursando') {
        //     const [{ lastStatus, _id }] =  await this.studentRepository.entity.aggregate([
        //         { $match: { user: userId } },
        //         { $addFields: { lastStatus: { $last: '$statusHistory' }} }
        //     ]);

        //     if(lastStatus.status !== 'baja' ) {
        //         await this.studentRepository.updateOne(
        //             { id: _id },
        //             { $push: {
        //                 statusHistory: {
        //                     status: 'baja'
        //                 }
        //             }}
        //         )
        //     }
        // }
    }

    const validHistory = await this.subjectHistoryRepository.entity.aggregate([
        { $match: { 
            user: userId, 
        }},
        { $addFields: { 
            lastPhase: { $last: '$phase' },
            totalPhases: { $size: '$phase' } 
        }},
        { $match: { 
             totalPhases: 3,  
             lastPhase: { $ne: 'aprobado' }
        }}
    ]);


    if(validHistory.length === 0) {
        return await this.studentRepository.updateOne({ user: userId, atRisk: 'ultimo intento' }, { atRisk: 'no' });
    } 

   }

    async create({ userId, subjectId, phaseStatus, semester, mode }) {
        
        if ( !userId || !subjectId || !phaseStatus || !semester ) 
            throw this.createAppError('Todos los campos son obligatorios', 400);

        if(!ObjectId.isValid(userId) || !ObjectId.isValid(subjectId)) 
            throw this.createAppError('Estudiando o materia no valido', 400);

        const userMongoId = ObjectId(userId);
        const subjectMongoId = ObjectId(subjectId);
        
        const subjectInHistory = await this.subjectHistoryRepository.findOne({
            student: userMongoId,
            subject: subjectMongoId
        }).lean();
        
        if(subjectInHistory) {
            const request = {
                docId: subjectInHistory._id,
                phaseStatus,
                semester,
                mode
            } 
            return this.addNewPhase(request);
        }

        const subjectCreated = await this.subjectHistoryRepository.create({
            student: userMongoId,
            subject: subjectMongoId,
            phase: [{
                phaseStatus,
                semester,
                mode
            }],
        });
        
        if(!subjectCreated) 
            throw this.createAppError('No se pudo concluir su registro', 500);

    }

    async addNewPhase({ docId, phaseStatus, date, semester, mode }) {
        
        const { phase, mongoId, user, subject } = await this.validBeforeSavePhase({
            id: docId,
            fieldToFind: '_id',
            phaseStatus,
            semester
        });

        if(phase.length === 3) {
            throw this.createAppError('El alumno ya alcanzo su tercer intento con la materia', 400);
        }
        
        this.validModeBeforeToSave({ phase: phase[phase.length - 1], mode, semester });

        const newPhase = { phaseStatus, date, semester };

        const phaseAdded = await this.subjectHistoryRepository.updateOne(
            { _id: mongoId },
            { $push: { phase:  newPhase }
        });

        const { nModified } = phaseAdded;

        if(nModified <= 0) 
            throw this.createAppError('No se pudo agregar la materia al alumno', 500);
    
        await this.assingLastChance( user, subject );

    }

    validModeBeforeToSave({ phase, mode, semester }) {
        
        if( phase?.semester === semester ) {
            if(phase.mode === mode) {
                throw this.createAppError('No puedes cargar la misma modalidad el mismo semestre', 400);
            }
            
            if(phase.mode === 'intersemestral' || mode !== 'intersemestral') {
                throw this.createAppError('No puedes cargar el mismo semestre que no se intersemestral', 400);
            }
        }
        
        if( phase?.semester > semester ) {
            throw this.createAppError('El semestre tiene que ser mayor al ultimo semestre cursado de la materia', 400);
        }
    }

    async updatePhase({ phaseId, phaseStatus, date, semester, mode = 'normal' }) {
    
        const { phase, mongoId, subject, user } = await this.validBeforeSavePhase({
            id: phaseId,
            fieldToFind: 'phase._id',
            phaseStatus,
            semester,
        });

        if( phase.length > 1 ) 
            this.validModeBeforeToSave({ phase: phase[phase.length - 2], mode, semester });
        

        const phaseUpdated = await this.subjectHistoryRepository.updateOne(
            { "phase._id": mongoId },
            { "$set": { 
                "phase.$.phaseStatus": phaseStatus,
                "phase.$.date": date ?? Date.now(),
                "phase.$.semester": semester
            }}
        );
        
        if(phaseUpdated.n <= 0) {
            throw this.createAppError('No se pudo actualizar la fase', 500);
        }

        await this.assingLastChance( user, subject );

    }
        
    async deletePhase( phaseId ) {

        if(!ObjectId.isValid(phaseId)) {
            throw this.createAppError('La fase no es valida, favor de verificarla', 400);
        }

        const phaseMongoId = ObjectId(phaseId);

        const subjectDeleted  = await this.subjectHistoryRepository.deleteOne({
             "phase._id": phaseMongoId,
             "phase": { $size: 1 }
        });

        if(!subjectDeleted) {
            const { student, subject } = await this.subjectHistoryRepository.findOne({ 'phase._id': phaseMongoId });
            const phaseDeleted = await this.subjectHistoryRepository.updateOne(
                { "phase._id": phaseMongoId  },
                { $pull: { "phase": { "_id": phaseMongoId }}},
            );
    
            if(phaseDeleted.n <= 0 || !phaseDeleted ) 
                throw this.createAppError('No se pudo eliminar el intento de la materia', 500);

            await this.assingLastChance( student, subject );
        }
        
    }

}

module.exports = SubjectHistoryService;