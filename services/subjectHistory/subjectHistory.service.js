const { Types } = require('mongoose');

class SubjectHistoryService  {

    constructor({ StudentHistoryRepository,  UserRepository, createAppError }) {
        this.studentHistoryRepository = StudentHistoryRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }

    async findBySemester({ userId, semester }) {

    }

    async create({ userId, subjectId, statusPhase, date, semester }) {


        if(!userId || !subjectId || !statusPhase || !date || !semester) 
            throw this.createAppError('Todos los campos son obligatorios', 500);

        

    }

}

module.exports = SubjectHistoryService;