const { Types } = require('mongoose');

class ProfessorService  {

    constructor({ ProfessorRepository, UserRepository, FileService, createAppError }) {
        this.professorRepository = ProfessorRepository;
        this.userRepository = UserRepository;
        this.fileService = FileService;
        this.createAppError = createAppError;
    }

    checkFields({ name, gender, active, subjects, email }) {
        if (!name || !gender || !active || !email || !subjects) {
            throw this.createAppError('Todos los campos son obligatorios', 400);
        }
    }

    async find(query) {
        console.log(query);
        const professorQuery = {...query,  roles: 'professor'};
        return await Promise.all(this.userRepository.findAll(professorQuery));
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        const professor = await this.professorRepository.findOne({user: Types.ObjectId(id)}, { 
            path: 'subjects',
            select: 'name semester deprecated'
        }).populate({
            path: 'courses',
            select: '-__v'
        }).populate({
            path: 'user',
            select: '-__v'
        });


        if(!professor) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        const { user, subjects, courses } = professor;
        const returned = {...user._doc, subjects, courses};

        return returned;

    }

    async findForExcel() {
    
        const professors = await this.userRepository.entity.aggregate([
            { $match: { roles: 'professor' } },
            {
                $lookup: {
                    from: 'professors',
                    foreignField: "user",
                    localField: "_id",
                    pipeline: [
                        { $project: { subjects: 1,  _id: 1 } }
                    ],
                    as: "professor"
                },
            },
            {
                $lookup: {
                    from: 'subjects',
                    foreignField: "professor.subjects",
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
                    localField: "professor._id",
                    pipeline: [
                        { $project: { name: 1,  _id: 0 } }
                    ],
                    as: "courses"
                },
            },
            {
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
            }
        ]);

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

        if(!professorDeleted) 
            throw this.createAppError('No se pudo eliminar el profesor', 500);
        
        return professorDeleted;
    }
 

    async create({ userId, subjects }) {

        if(!userId || !subjects) 
            throw this.createAppError('El usuario y materias son obligatorios', 500);

        const professorCreated = await this.professorRepository.create({
            user: userId,
            subjects,
        });

        if (!professorCreated)
            throw this.createAppError('No se pudo concluir su registro', 500);

        return professorCreated;
    }


    async updateById(userId, { subjects }) {

        const professorUpdated = await this.professorRepository.updateOne({user: userId}, { subjects });

        if (!professorUpdated)
            throw this.createAppError('No se pudo actualizar los datos', 400);
  
      return professorUpdated;
    }

    async setActive(id, { active }) {

        if(!id || typeof active !== 'boolean') {
          throw this.createAppError('Todos los campos son obligatorios', 400);      
        }
    
        const professor = await this.userRepository.updateById(id, { active });
    
        if (!professor)
          throw this.createAppError('No se pudo actualizar los datos', 400);
    
        return professor;
    
    }
    

}

module.exports = ProfessorService;