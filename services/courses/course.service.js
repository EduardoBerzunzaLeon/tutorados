class CourseService  {

    constructor({ CourseRepository, FileService, createAppError }) {
        this.courseRepository = CourseRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }


    async find(query) {
        return await this.courseRepository.findAll(query);
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
        professor, 
     }) {

        const CourseCreated = await this.courseRepository.create({
            name,
            impartedAt,
            professor,
        });

        if(!CourseCreated) 
            throw this.createAppError('No se pudo concluir su registro', 500);

        return CourseCreated;

    }

    async updateById(id, { 
        name, 
        impartedAt, 
        professor, 
    }) {

        const courseUpdated = await this.courseRepository.updateById(id, { 
            name, 
            impartedAt,
            professor
        });

        if (!courseUpdated)
          throw this.createAppError('No se pudo actualizar los datos', 400);
    
        return courseUpdated;
    }

}

module.exports = CourseService;