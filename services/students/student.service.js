class StudentService  {

    constructor({ StudentRepository, UserRepository, createAppError }) {
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }






    async find(query) {
        // const studentQuery = {...query,  roles: 'student'};
        // return await Promise.all(this.userRepository.findAll(studentQuery));
        
        const students =  await this.studentRepository.entity.aggregate([
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
                    { $project: { name: 1, gender: 1,  _id: 1 } }
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
                    { $match: { roles: 'professor' }},
                    { $project: { name: 1,  _id: 1 } }
                ],
                as: "professor"
            }},{ $unwind: "$professor" },
           {
               $project: {
                    _id: 1,
                    userId: "$userData._id",
                    name: "$userData.name",
                    enrollment: 1,
                    currentSemester: 1,
                    gender: "$userData.gender",
                    atRisk: 1,
                    status: {
                        $last: "$statusHistory"
                    },
                    professor: '$professor'
                }
           },
           {
                $match: {
                    // 'gender': { $regex: 'F', $options: 'g'},
                    // 'name.first': { $regex: 'stu', $options: 'g'},
                    // 'status.status': { $regex: 'regular', $options: 'g'}
                    // 'professor.name.first': { $regex: 'a', $options: 'g'}
                    currentSemester: 1
                }
            },
           { $sort : { "name.first" : -1 } },
           { '$facet' : {
            metadata: [ { $count: "total" }, { $addFields: { page: 3 } } ],
            data: [ { $skip: 0 }, { $limit: 10 } ]
            }},
        ]);

    // ? Fields: matricula | Nombre | Apellido | Semestre | Genero | Status History (last) | Tutor (Last) | Si esta en Riesto | Actions
        console.log(students[0].data);

    }

    async create({ userId, professor, enrollment, currentSemester, status}) {

        const professorsHistory = [{ professor }];
        const statusHistory = [{ status }];
 
        const data = {
            user: userId,
            professorsHistory,
            enrollment,
            currentSemester,
            statusHistory
        };

        const studentCreated = await this.studentRepository.create(data);

        if (!studentCreated)
            throw this.createAppError('No se pudo crear el detalle del alumno', 500);

        // ! DELETE THIS

        const user = await this.userRepository.findById(userId);
        
        return user;
    }
    

}

module.exports = StudentService;