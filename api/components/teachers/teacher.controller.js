class TeacherController {

    constructor({ TeacherService, teachers }) {
        this._teacherService = TeacherService;
    }

    async getTeachers(req, res) {
        
        const teachers = await this._teacherService.getAll();
        // TODO: teachers = teachers.map(teacher => mapper(TeacherDto, teacher));
        return res.status(200).json({
            ok: true,
            data: teachers
        })
    
    }
}

module.exports = TeacherController;