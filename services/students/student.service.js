class StudentService  {

    constructor({ StudentRepository, UserRepository, createAppError }) {
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }

    // ? Fields: matricula | Nombre | Apellido | Email | Semestre | Genero | Status History (last) | Tutor (Last) | Actions

    async find(query) {
        const studentQuery = {...query,  roles: 'student'};
        return await Promise.all(this.userRepository.findAll(studentQuery));
    }

    async create({ userId, professor, enrollment, currentSemeter, status}) {

        const professorsHistory = [{ professor }];
        const statusHistory = [{ status }];
 
        const data = {
            user: userId,
            professorsHistory,
            enrollment,
            currentSemeter,
            statusHistory
        };

        const studentCreated = await this.studentRepository.create(data);

        if (!studentCreated)
            throw this.createAppError('No se pudo crear el detalle del alumno', 500);
        
        return studentCreated;
    }
    

}

module.exports = StudentService;