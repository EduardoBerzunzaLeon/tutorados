const { Types } = require('mongoose');

class SubjectHistoryService  {

    constructor({ StudentHistoryRepository,  UserRepository, createAppError }) {
        this.studentHistoryRepository = StudentHistoryRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }

    async findBySemester({ userId, semester }) {

        // get with agregation the subject and phase by semester + student

    }

    async create({ userId, subjectId, phaseStatus, date, semester }) {

        if(!userId || !subjectId || !phaseStatus || !date || !semester) 
            throw this.createAppError('Todos los campos son obligatorios', 500);

        // Check the subject + student +  semester dont exist in collection
        // or subject + student and  phase has 3 steps
        // Return and Error

        // if exist subject + student (addNewPhase) else (createSubjectInHistory); 

       
    }

    async createSubjectInHistory({ userId, subjectId, phaseStatus, date, semester }) {

        const  dataToSave = {
            user: userId,
            subject: subjectId,
            phase: [{
                phaseStatus,
                date,
                semester
            }]
        };

        const subjectCreated = await this.studentHistoryRepository.create(dataToSave);
        
        if (!subjectCreated)
            throw this.createAppError('No se pudo crear el detalle del alumno', 500);

    }

    async addNewPhase({ docId, phaseStatus, date, semester }) {

        const phase = { phaseStatus, date, semester };
        const phaseAdded = await  this.studentHistoryRepository.updateOne(
            { _id: docId },
            { $push: { phase }
        });

        const { nModified } = phaseAdded;

        if(nModified <= 0) 
            throw this.createAppError('No se pudo agregar la materia al alumno', 500);
        
    }

    // Don´t sure if use userId + subjectId or docId  or phaseId
    async  updateById({ phaseId, phaseStatus, date, semester }) {
        
        if(!phaseId || !phaseStatus || !date || !semester) 
        throw this.createAppError('Todos los campos son obligatorios', 500);
        
        const phaseUpdated = await this.studentHistoryRepository.updateOne(
            { "professorsHistory._id": phaseId },
            { "$set": { 
                "professorsHistory.$.dischargeAt": createdAt,
                "professorsHistory.$.comments": sanatizedComments
            }});
            
            if(phaseUpdated.n <= 0) {
                throw this.createAppError('No se pudo actualizar la materia actual', 500);
            }
        }
        
        // Don´t sure if use userId + subjectId or docId  or phaseId
    async deletePhase({ phaseId, userId, subjectId }) {

        const phaseIdMongo = Types.ObjectId(phaseId);
        const userIdMongo = Types.ObjectId(userId);
        const subjectIdMongo = Types.ObjectId(subjectId);

        const phaseDeleted = await this.studentHistoryRepository.updateOne(
            { student: userIdMongo, subject: subjectIdMongo},
            { $pull: { "professorsHistory": { "_id": phaseIdMongo }}},
        );

        if(phaseDeleted.n <= 0) 
            throw this.createAppError('No se pudo eliminar el intento de la materia', 500);

    }

}

module.exports = SubjectHistoryService;