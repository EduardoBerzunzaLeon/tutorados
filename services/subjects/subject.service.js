class SubjectService  {

    constructor({ SubjectRepository, FileService, createAppError }) {
        this.subjectRepository = SubjectRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }


    async findSubjects(query) {
        return await this.subjectRepository.findAll(query);
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        const subject = await this.subjectRepository.findById(id);

        if(!subject) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        return subject;

    }

    async deleteById(id) {
        return await this.subjectRepository.deleteById(id);
    }

    async create({ 
        name, 
        semester, 
        credit, 
        consecutiveSubject
     }) {

        const subjectExists = await this.subjectRepository.findOne({ name });
        if (subjectExists) throw this.createAppError('Materia ya existe', 401);

        const subjectCreated = await this.subjectRepository.create({
            name,
            semester,
            credit,
            consecutiveSubject
        });

        if(!subjectCreated) 
            throw this.createAppError('No se pudo concluir su registro', 500);

        return subjectCreated;

    }

    async updateById(id, subjectData) {

        const subject = await this.subjectRepository.findById(id);

        if (!subject) {
            throw this.createAppError('No se encontró la materia.', 404);
        }

        Object.assign(subject, {...subjectData});

        const subjectSaved = await this.subjectRepository.save(subject);
        
        return subjectSaved;
    }

}

module.exports = SubjectService;


