class TeacherService {

    constructor({ TeacherRepository }) {
        this._teacherRepository = TeacherRepository;
    }

    async getTeachers() {
        return await this._teacherRepository.getTeachers();
    }
}

module.exports = TeacherService;