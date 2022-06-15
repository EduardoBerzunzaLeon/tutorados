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
                    { $project: { name: 1, gender: 1,  _id: 1, avatar: 1 } }
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
                    id: "$_id",
                    _id: 0,
                    userId: "$userData._id",
                    name: "$userData.name",
                    avatar: "$userData.avatar",
                    enrollment: 1,
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

           console.log(data[1][0].professor[0]);

        return data;

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

    

}

module.exports = StudentService;