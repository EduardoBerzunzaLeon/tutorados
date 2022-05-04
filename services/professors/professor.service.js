class ProfessorService  {

    constructor({ ProfessorRepository, FileService, createAppError }) {
        this.professorRepository = ProfessorRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }


    async findProfessors(query) {
        return await this.professorRepository.findAll(query);
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        const professor = await this.professorRepository.findById(id, { 
            path: 'subject'
        });

        if(!professor) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        return professor;

    }

    async deleteById(id) {
        const professorDeleted = await this.professorRepository.deleteById(id);

        if(professorDeleted?.avatar) {
            await this.fileService.deleteFile(professorDeleted.avatar);
        }

        return professorDeleted;
    }

    async create({ 
        first,
        last,
        email,
        gender,
        active,
        subjects
    }, file) {

        const name = { first, last };

        const professorExists = await this.professorRepository.findOne({ email });

        if ( professorExists ) throw this.createAppError('El profesor ya existe', 404);

        const professorCreated = await this.professorRepository.create({
            name,
            email,
            gender,
            active,
            subjects
        });

        if (!professorCreated)
            throw this.createAppError('No se pudo concluir su registro', 500);


        if(file) {
            const uploadFile = this.fileService.uploadFile('professors');
            const image = await uploadFile.bind(this.fileService, file)();

            await this.fileService.saveInDB(
                professorCreated.id,
                this.fileService,
                image,
                'avatar'
            );
        }

        return professorCreated;
    }

    async updateById(id, {
        first,
        last,
        email,
        gender,
        active,
        subjects
    }) {

        const name = { first, last };

        if(file) {
            const uploadFile = this.fileService.uploadFile('professors');
            const image = await uploadFile.bind(this.fileService, file)();
        
            await this.fileService.saveInDB(
                id,
                this.professorRepository,
                image,
                'avatar'
            );
        }

        const professorUpdated = await this.professorRepository.updateById(id, {
            name,
            email,
            gender,
            active,
            subjects
        });

        if (!professorUpdated)
        throw this.createAppError('No se pudo actualizar los datos', 400);
  
      return professorUpdated;
    }

}

module.exports = ProfessorService;