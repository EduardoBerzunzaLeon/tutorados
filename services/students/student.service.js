const { Types } = require('mongoose');

class StudentService  {

    globalFields = [
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
            field: 'inChanelling',
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

    gloablAggregation = [{
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
    }},{ $unwind: "$professor" }];

    constructor({ StudentRepository,  UserRepository, createAppError }) {
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }

    async find(query) {        
        const aggregation= [...this.gloablAggregation,
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
                    inChannelling: 1,
                    status: {
                        $last: "$statusHistory"
                    },
                    professor: "$professor"
                }
           }];

        const data =  await this.studentRepository.findAggregation(aggregation, query, this.globalFields);
        return data;
    }
    
    async findByExcel(query) {        
        const aggregation= [...this.gloablAggregation,
           {
               $project: {
                    _id: 0,
                    name: "$userData.name",
                    active: "$userData.active",
                    email: "$userData.email",
                    enrollment: 1,
                    classroom: 1,
                    currentSemester: 1,
                    gender: "$userData.gender",
                    atRisk: 1,
                    inChannelling: 1,
                    status: { $last: "$statusHistory" },
                    professor: "$professor"
                }
           }];

        const { limit, ...restQuery } = query;

        const data =  await this.studentRepository.findAggregation(aggregation, restQuery, this.globalFields);
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

    async addNewProfessor(userId, { currentProfessorHistoryId, newProfessorId, createdAt, comments  } ) {

        if(!currentProfessorHistoryId) {
            throw this.createAppError('El tutor actual es requerido', 400);
        }
        
        const currentProfessorHistoryIdMongo = Types.ObjectId(currentProfessorHistoryId);
        const newProfessorIdMongo = Types.ObjectId(newProfessorId);
        const userIdMongo = Types.ObjectId(userId);
        const sanatizedComments = comments || '';

        const lastTutor = await this.studentRepository.entity.aggregate([
            { $match: { user: userIdMongo } },
            { $addFields: { lastProfessor: { $last: '$professorsHistory'} } },
            { $match: { "lastProfessor.professor": newProfessorIdMongo} }
        ]);
        
        if(lastTutor.length !== 0) {
            throw this.createAppError('El nuevo tutor no puede ser el tutor inmediato anterior', 400);
        }

        const updatedCurrentProfessor = await this.studentRepository.updateOne(
            { "professorsHistory._id": currentProfessorHistoryIdMongo },
            { "$set": { 
                "professorsHistory.$.dischargeAt": createdAt,
                "professorsHistory.$.comments": sanatizedComments
            }});
        
        if(updatedCurrentProfessor.n <= 0) {
            throw this.createAppError('No se pudo actualizar el tutor actual', 500);
        }

        const newProfessor = {
            professor: newProfessorId,
            idProfessorBefore: currentProfessorHistoryIdMongo ,
            createdAt
        };

        const addProfessor = await this.studentRepository.updateOne(
            { "user": userIdMongo },
            { $push: { professorsHistory:  newProfessor }});

        const { nModified } = addProfessor;

        if(nModified <= 0) {
            throw this.createAppError('No se pudo agregar el tutor al alumno', 500);
        }
        
    }

    async deleteProfessorInHistory(userId, professorHistoryId) {

        if(!userId || !professorHistoryId) {
            throw this.createAppError('El alumno y el profesor son requeridos', 400);
        }

        const userIdMongo = Types.ObjectId(userId);
        const professorHistoryIdMongo = Types.ObjectId(professorHistoryId);

        const numberOfProfessorsResult = await this.studentRepository.entity.aggregate([
            { $match: { user: userIdMongo } },
            { $addFields: { lastProfessor: { $last: '$professorsHistory'} } },
            { $project: { 
                numberOfProfessors: { $size: "$professorsHistory" },
                idProfessorBefore: "$lastProfessor.idProfessorBefore"
            }},
        ]);


        if(!numberOfProfessorsResult || numberOfProfessorsResult[0].numberOfProfessors === 1 ) {
            throw this.createAppError('No se puede eliminar el unico profesor asignado', 400);
        } 

        const [{ idProfessorBefore }] = numberOfProfessorsResult;
        const idProfessorBeforeMongo = Types.ObjectId(idProfessorBefore);

        const updateProfessorBefore = this.studentRepository.updateOne(
            { "professorsHistory._id": idProfessorBeforeMongo },
            { "$set": { 
                "professorsHistory.$.dischargeAt": undefined,
                "professorsHistory.$.comments": ''
            }});
        
        const deleteProfessor =  this.studentRepository.updateOne(
            { user: userIdMongo },
            { $pull: { "professorsHistory": { "_id": professorHistoryIdMongo }}},
            { multi: true }
        );

        const [{ nModified: nUpdateModified }, { nModified: nDeleteModified } ] = await Promise.all([updateProfessorBefore, deleteProfessor]);

        if(nUpdateModified <= 0 || nDeleteModified <= 0) {
            throw this.createAppError('No se pudo desvincular el tutor al alumno', 500);
        }
    }


    async updateProfessorInHistory(userId, professorHistoryId, { createdAt, professorId , comments, professorBeforeId }) {

        if(!userId || !professorHistoryId || !createdAt || !professorId) {
            throw this.createAppError('Todos los campos son requeridos', 400);
        }

        const userIdMongo = Types.ObjectId(userId);
        const professorHistoryIdMongo = Types.ObjectId(professorHistoryId);
       
        const lastTutor = await this.studentRepository.entity.aggregate([
            { $match: { user: userIdMongo } },
            { $addFields: { lastProfessor: { $last: '$professorsHistory'} } },
            { $match: { "lastProfessor._id": professorHistoryIdMongo } } 
        ]);


        if(lastTutor.length !== 1) {
            throw this.createAppError('No se puede actualizar un tutor diferente al ultimo agregado', 400);
        }

        if(professorBeforeId) {
            const professorBeforeIdMongo = Types.ObjectId(professorBeforeId);
            const sanatizedComments = comments || '';
    
            const { n } = await this.studentRepository.updateOne(
                { "professorsHistory._id": professorBeforeIdMongo },
                { "$set": { 
                    "professorsHistory.$.dischargeAt": createdAt,
                    "professorsHistory.$.comments": sanatizedComments
                }});

            if(n <= 0) {
                throw this.createAppError('No se pudo actualizar el tutor anterior', 500);
            }

            const [{ professor: [{ professor: previousProfessor }] }] =  await this.studentRepository.entity.aggregate([
                { $match: { "user": userIdMongo } },
                {
                    $project: {
                        professor: {
                            $filter: {
                                input: "$professorsHistory",
                                as: 'professorsHistory',
                                cond: { $eq: ['$$professorsHistory._id', professorBeforeIdMongo] }
                            }
                        }
                    }
                }
            ]);

            if(`${previousProfessor}` === professorId ){
                throw this.createAppError('El nuevo tutor no puede ser el tutor inmediato anterior', 400);
            }
            
        }

        const { n } = await this.studentRepository.updateOne(
            { "professorsHistory._id": professorHistoryIdMongo },
            { "$set": { 
                "professorsHistory.$.professor": professorId,
                "professorsHistory.$.createdAt": createdAt,
            }});

        if(n <= 0) {
            throw this.createAppError('No se pudo actualizar el tutor', 500);
        }
    }


}

module.exports = StudentService;