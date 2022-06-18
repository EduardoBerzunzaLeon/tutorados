const { Types } = require('mongoose');

class StudentService  {

    constructor({ StudentRepository,  UserRepository, createAppError }) {
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }


    async find(query) {
        const globalFields = [
            {
                field: 'name.first',
                type: 'string',
            },
            {
                field: 'name.last',
                type: 'string',
            },
            {
                field: 'enrollment',
                type: 'string',
            },
            {
                field: 'classroom',
                type: 'string',
            },
            {
                field: 'gender',
                type: 'string',
            },
            {
                field: 'atRisk',
                type: 'string',
            },
            {
                field: 'status.status',
                type: 'string',
            },
            {
                field: 'professor.name.first',
                type: 'string',
            },
            {
                field: 'professor.name.last',
                type: 'string',
            },
            {
                field: 'currentSemester',
                type: 'number',
            }];

        const aggregation= [
            {
                $addFields: { lastProfessor: { $last: '$professorsHistory'}}
            },
           {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "user",
                pipeline: [
                    { $match: { roles: 'student' }},
                    { $project: { name: 1, gender: 1, email: 1, active: 1, _id: 1, avatar: 1 } }
                ],
                as: "userData"
            },
           },
           { $unwind: "$userData" },
           {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "lastProfessor.professor",
                pipeline: [
                    { $project: { name: 1,  _id: 1, avatar: 1 } }
                ],
                as: "professor"
            }},
            { $unwind: "$professor" },
           {
               $project: {
                    id: "$userData._id",
                    _id: 0,
                    studentId: "$_id",
                    name: "$userData.name",
                    avatar: "$userData.avatar",
                    active: "$userData.active",
                    email: "$userData.email",
                    enrollment: 1,
                    classroom: 1,
                    currentSemester: 1,
                    gender: "$userData.gender",
                    atRisk: 1,
                    status: {
                        $last: "$statusHistory"
                    },
                    professor: "$professor"
                }
           }];

        const data =  await this.studentRepository.findAggregation(aggregation, query, globalFields);

        return data;
    }

    async findProfessorsHistory(userId) {

        const aggregation = [
            {
              '$match': {
                'user': Types.ObjectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$professorsHistory'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'professorsHistory.professor', 
                'foreignField': '_id', 
                pipeline: [
                    { $project: { name: 1, _id: 1, avatar: 1 } }
                ],
                'as': 'professorsHistory.professor'
              }
            }, {
              '$unwind': {
                'path': '$professorsHistory.professor'
              }
            }, {
              '$group': {
                '_id': '$_id', 
                'professorsHistory': {
                  '$push': '$professorsHistory'
                }
              }
            }
          ];

        const [ , data] = await this.studentRepository.findAggregation(aggregation);

        const [ newData ] = data;
        return newData;
    }


    async create({ userId, studentData }) {

        if(!userId) 
            throw this.createAppError('El usuario es obligatorios', 500);

        const studentInfo = studentData ?? { 
            enrollment: 'AAAAAA', 
            currentSemester: 1,
            classroom: 'A',
            professor: '608064aa1d7963091081ab5d',
            comments: 'El maestro es la asginacion por defecto'
        };

        const professorsHistory = [{ 
            professor: studentInfo.professor, 
            comments: studentInfo.comments || ''
        }];

        const statusHistory = [{ status: 'regular' }];
    
        const data = {
            user: userId,
            professorsHistory,
            enrollment: studentInfo.enrollment,
            currentSemester: studentInfo.currentSemester,
            classroom: studentInfo.classroom,
            statusHistory
        };

        const studentCreated = await this.studentRepository.create(data);

        if (!studentCreated)
            throw this.createAppError('No se pudo crear el detalle del alumno', 500);
        
        return studentCreated;
    }

    async updateById(userId,  { enrollment, currentSemester, classroom } ) {

        if(!enrollment || !currentSemester || !classroom) {
            throw this.createAppError('Todos los campos escolares son obligatorios', 400);
          }

        const studentUpdated = await this.studentRepository.updateOne({ user: userId }, { 
            enrollment,
            currentSemester,
            classroom
         });

        if (!studentUpdated)
            throw this.createAppError('No se pudo actualizar los datos escolares', 400);
  
      return studentUpdated;
    }

    async addNewProfessor(userId, { currentProfessorId, newProfessorId, createdAt, comments  } ) {

        if(!currentProfessorId) {
            throw this.createAppError('El tutor actual es requerido', 400);
        }
        
        const currentProfessorIdMongo = Types.ObjectId(currentProfessorId);
        const newProfessorIdMongo = Types.ObjectId(newProfessorId);
        const userIdMongo = Types.ObjectId(userId);
        const sanatizedComments = comments || '';


        const lastTutor = await this.studentRepository.entity.aggregate([
            { $match: { user: userIdMongo } },
            { $addFields: { lastProfessor: { $last: '$professorsHistory'} } },
            { $match: { "lastProfessor.professor": newProfessorIdMongo} }
        ]);

        if(lastTutor) {
            throw this.createAppError('El nuevo tutor no puede ser el tutor inmediato anterior', 400);
        }

        const updatedCurrentProfessor = await this.studentRepository.updateOne(
            { "professorsHistory.professor": currentProfessorIdMongo },
            { "$set": { 
                "professorsHistory.$.dischargeAt": createdAt,
                "professorsHistory.$.comments": sanatizedComments
            }});

        if(!updatedCurrentProfessor) {
            throw this.createAppError('No se pudo actualizar el tutor actual', 500);
        }

        const newProfessor = {
            professor: newProfessorId,
            createdAt
        };

        const addProfessor = await this.studentRepository.updateOne(
            { "user": userIdMongo, "professorsHistory.professor": { $last: { $nin: newProfessorIdMongo } } },
            { $push: { professorsHistory:  newProfessor }});
        
        return addProfessor;
    }

    async deleteProfessorInHistory(userId, professorId) {

        if(!userId || !professorId) {
            throw this.createAppError('El alumno y el profesor son requeridos', 400);
        }

        const userIdMongo = Types.ObjectId(userId);
        const professorIdMongo = Types.ObjectId(professorId);

        const numberOfProfessorsResult = await this.studentRepository.entity.aggregate([
            { $match: { user: userIdMongo } },
            { $project: { numberOfProfessors: { $size: "$professorsHistory" } } },
        ]);

        if(!numberOfProfessorsResult || numberOfProfessorsResult[0].numberOfProfessors === 1 ) {
            throw this.createAppError('No se puede eliminar el unico profesor asignado', 400);
        } 
        
        const deletedProfessor = await this.studentRepository.updateOne(
            { user: userIdMongo },
            { $pull: { "professorsHistory": { professor: professorIdMongo }}},
            { multi: true }
        );

        const { nModified } = deletedProfessor;

        if(nModified <= 0) {
            throw this.createAppError('No se desvincular el tutor al alumno', 500);
        }
    }

}

module.exports = StudentService;