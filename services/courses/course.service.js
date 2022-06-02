class CourseService  {

    constructor({ CourseRepository, ProfessorRepository, FileService, createAppError }) {
        this.courseRepository = CourseRepository;
        this.professorRepository = ProfessorRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }


    async find(query) {
        let sanitizedQuery = query;
        if(query.professor) {
            const professor = await this.professorRepository.findOne({ user: query.professor });
            sanitizedQuery = {...query, professor};
        }
        return await Promise.all(this.courseRepository.findAll(sanitizedQuery));
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        const course = await this.courseRepository.findById(id);

        if(!course) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        return course;

    }

    async deleteById(id) {
        return await this.courseRepository.deleteById(id);
    }

    async create({ 
        name, 
        impartedAt, 
        user, 
     }) {

        const professor = await this.professorRepository.findOne({ user });

        if(!professor) 
            throw this.createAppError('No se encontro el professor', 500);

        const CourseCreated = await this.courseRepository.create({
            name,
            impartedAt,
            professor: professor.id,
        });

        if(!CourseCreated) 
            throw this.createAppError('No se pudo concluir su registro', 500);

        return CourseCreated;

    }

    async updateById(id, { 
        name, 
        impartedAt, 
        user, 
    }) {
        const professor = await this.professorRepository.findOne({ user });

        if(!professor) 
            throw this.createAppError('No se encontro el profesor', 500);

        const courseUpdated = await this.courseRepository.updateById(id, { 
            name, 
            impartedAt,
            professor: professor.id
        });

        if (!courseUpdated)
          throw this.createAppError('No se pudo actualizar los datos', 400);
    
        return courseUpdated;
    }

}

module.exports = CourseService;