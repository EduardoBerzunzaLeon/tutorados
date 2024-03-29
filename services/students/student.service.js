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

    globalAggregation = [{
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

    constructor({ 
        StudentRepository,  
        UserRepository, 
        createAppError, 
        ProfessorService,
        generateRandomString
    }) {
        this.professorService = ProfessorService;
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
        this.generateRandomString = generateRandomString;
    }

    async find(query) {        
        const aggregation= [...this.globalAggregation,
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
        console.log(query);
        return data;
    }
    
    async findByExcel(query) {        
        const aggregation = [...this.globalAggregation,
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
    
    async findByField(user, query, field) {

        const { roles, _id } = user;
        const aggregation = [{
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'user',
                pipeline: [
                    { $project: { _id: 1, email: 1, gender: 1, avatar: 1, name: 1}}
                ],
                as: 'user',
            }
        },
        { $unwind: '$user'},
        { $project: {
            _id: 1,
            currentSemester: 1,
            classroom: 1,
            atRisk: 1,
            inChannelling: 1,
            user: 1,
            enrollment: 1,
        }}];

        if(roles.includes('professor') && !roles.includes('admin')) {
            return  await this.studentRepository.findAggregation([
                { $addFields: { lastProfessor: { $last: '$professorsHistory.professor'} }},
                { $match: { lastProfessor: _id, [field]: { $ne: 'no' }}},
                ...aggregation
             ], query);
        }

        if(roles.includes('admin')) {
            return await this.studentRepository.findAggregation([
                { $match: { [field]: { $ne: 'no' }}},
                ...aggregation
             ], query);
        }

        return [];

    }

    async create({ userId, studentData }) {

        if(!userId) 
            throw this.createAppError('El usuario es obligatorios', 500);


        const { user } = await this.professorService.findDefaultProfessor();
        
        const studentInfo = studentData ?? { 
            enrollment: this.generateRandomString(5), 
            currentSemester: 1,
            classroom: 'A',
            professor: user._id,
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

    async increaseSemester(amount = 1) {

        const students = await this.studentRepository.entity.aggregate([
            { $addFields: { lastStatus: { $last: '$statusHistory' }}},
            { $match: { 'lastStatus.status': 'regular', currentSemester: { '$ne': 13 }}},
            { $group:{ _id: null, ids: { $push: "$_id" }}},
            { $project:{ ids: true , _id: false }}
        ]);

        if (!students)
            throw this.createAppError('No se pudo actualizar los datos escolares', 400);
            
        if(students[0].ids.length > 0 ) {
            
            const [{ ids }] = students;
            
            const studentsUpdated = await this.studentRepository.updateMany(
                { _id: { "$in": ids }},
                { $inc: { currentSemester: amount }},
                { multi: true }
            );
                
            if(!studentsUpdated) 
                throw this.createAppError('No se pudo actualizar los datos escolares', 400);
        }

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

    async findStudent(userId) {
        const student = await this.studentRepository.findOne({ user: userId }).lean();

        if(!student) {
            throw this.createAppError('No se encontro al estudiante', 400);
        }

        return student;
    }


}

module.exports = StudentService;