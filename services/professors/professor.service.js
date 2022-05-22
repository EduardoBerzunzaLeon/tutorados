class ProfessorService  {

    constructor({ ProfessorRepository, FileService, createAppError }) {
        this.professorRepository = ProfessorRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }

    checkFields({ name, gender, active, subjects, email }) {
        if (!name || !gender || !active || !email || !subjects) {
            throw this.createAppError('Todos los campos son obligatorios', 400);
        }
    }

    async find(query) {
        return await Promise.all(this.professorRepository.findAll(query));
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        const professor = await this.professorRepository.findById(id, { 
            path: 'subjects',
            select: 'name semester deprecated'
        }).populate({
            path: 'courses',
            select: '-__v'
        });

        if(!professor) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        return professor;

    }

    async findForExcel() {

        console.log('excel')
        const professors = await this.professorRepository.entity.aggregate([{
            $lookup: {
                from: 'subjects',
                foreignField: "_id",
                localField: "subjects",
                pipeline: [
                    { $match: { deprecated: false }},
                    { $project: { name: 1,  _id: 0 } }
                ],
                as: "subjects"
            },
        },
        {
            $lookup: {
                from: 'courses',
                foreignField: "professor",
                localField: "_id",
                pipeline: [
                    { $project: { name: 1,  _id: 0 } }
                ],
                as: "courses"
            },
        },{
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                gender: {
                    $cond:  {
                        if: { $gte: [ "$gender", 'M' ] },
                        then: 'Hombre',
                        else: 'Mujer'
                    }
                },
                active: 1,
                createdAt: 1,
                subjects: {
                    $reduce: {
                        input: "$subjects.name",
                        initialValue: "",
                        in: {
                            $concat: [
                              "$$value",
                              {
                                $cond: {
                                  if: { $eq: [ "$$value", "" ] },
                                  then: "",
                                  else: ", "
                                }
                              },
                              "$$this"
                            ]
                          }
                    }
                },
                courses: {
                    $reduce: {
                        input: "$courses.name",
                        initialValue: "",
                        in: {
                            $concat: [
                              "$$value",
                              {
                                $cond: {
                                  if: { $eq: [ "$$value", "" ] },
                                  then: "",
                                  else: ", "
                                }
                              },
                              "$$this"
                            ]
                          }
                    }
                }
            }
        }])

        if(!professors) {
            throw this.createAppError(
              'No se encontraron maestros',
              404
            );
          }
      
        return professors;

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
        this.checkFields({ name, gender, active, subjects, email });

        const professorExists = await this.professorRepository.findOne({ email });

        if ( professorExists ) throw this.createAppError('El profesor ya existe', 404);

        const professorCreated = await this.professorRepository.create({
            name,
            email,
            gender,
            active,
            subjects,
            createdAt: Date.now()
        });

        if (!professorCreated)
            throw this.createAppError('No se pudo concluir su registro', 500);


        if(file) {

            console.log(file);
            const uploadFile = this.fileService.uploadFile('img/professors');
            const image = await uploadFile.bind(this.fileService, file)();

            try {
                await this.fileService.saveInDB(
                    professorCreated.id,
                    this.professorRepository,
                    image,
                    'avatar'
                );
            } catch (error) {
                await this.professorRepository.deleteById(professorCreated.id);
                throw error;
            }
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
    }, file) {

        
        const name = { first, last };
        console.log({name, email, gender, active, subjects});

        this.checkFields({ name, gender, active, subjects, email });

        console.log(file)
        if(file) {
            const uploadFile = this.fileService.uploadFile('img/professors');
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

    async setActive(id, { active }) {

        if(!id || typeof active !== 'boolean') {
          throw this.createAppError('Todos los campos son obligatorios', 400);      
        }
    
        const professor = await this.professorRepository.updateById(id, { active });
    
        if (!professor)
          throw this.createAppError('No se pudo actualizar los datos', 400);
    
        return professor;
    
      }
    

}

module.exports = ProfessorService;