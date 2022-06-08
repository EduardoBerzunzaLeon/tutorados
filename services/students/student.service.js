class StudentService  {

    constructor({ StudentRepository, UserRepository, createAppError }) {
        this.studentRepository = StudentRepository;
        this.userRepository = UserRepository;
        this.createAppError = createAppError;
    }


    filter(query) {

        const queryObj = { ...query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'sortOrder', 'global'];
        excludedFields.forEach((el) => {
            delete queryObj[el];
          });

          Object.keys(queryObj).forEach((el) => {
            if(queryObj[el]?.hasOwnProperty('between') ) {
              const [ gte, lte ] = queryObj[el].between.split(',');
              queryObj[el] = {
                gte,
                lte
              }
            }
          });

        const queryStr = JSON.stringify(queryObj).replace(
            /\b(gte|gt|lte|lt|ne|regex|between)\b/g,
            (match) =>  `$${match}`
            )
            .replaceAll('-', '.');

        return JSON.parse(queryStr);
    }

    sort(query) {
        const sortBy = query.sort.split(',');
            
        return sortBy.reduce((prev, current) => (Object.keys(prev).length === 0 && Object.getPrototypeOf(prev) === Object.prototype)
            ? { [current]: Number(query.sortOrder) || 1 }
            : {...prev, [current]: 1}, {});

    }

    paginate(query) {

        const page = query.page * 1 || 1;
        const limit = query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        
        return { '$facet' : {
            metadata: [ { $count: "total" }, { $addFields: { page } } ],
            data: [ { $skip: skip }, { $limit: limit } ]
            }};
        
    }

    filterGlobal(query, globalFields) {
        return globalFields.reduce((acc, current) => {
            const {field, type} = current;

            if(type === 'string') {
                return [...acc, {[field]: { $regex: query.global, $options: 'i'}}];
            }

            if(type === 'number' && !isNaN(query.global)) {
                return [...acc, {[field]: Number(query.global)} ];
            }

            return acc;
        }, []);
    }

    
    featuresAgregationBuilder(agregation, query, globalFields) {

        const newAgregation = [...agregation];
        // ? Filter 
        const queryFind =  this.filter(query);

        // console.log(queryFind);
        
        if(Object.keys(queryFind).length > 0) {
            newAgregation.push({
                $match: {...queryFind}
            }); 
        }

        //  global
        if(query.global && globalFields) {
            const globalFilterParams =  this.filterGlobal(query, globalFields);

            if(Object.keys(globalFilterParams).length > 0) {
                newAgregation.push({
                    $match: { $or: [...globalFilterParams]}
                }); 
            }
            
        }

        // ? Sort 
        if (query.sort) {
            const sortParams =  this.sort(query);
            newAgregation.push({ $sort: {...sortParams} });
        }

        // Pagination
        const paginateObj = this.paginate(query);
        newAgregation.push({...paginateObj});
        
         return newAgregation;
    
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

        const agre = this.featuresAgregationBuilder([
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
           }], query, globalFields);

           const students =  await this.studentRepository.entity.aggregate(agre);

    // ? Fields: matricula | Nombre | Apellido | Semestre | Genero | Status History (last) | Tutor (Last) | Si esta en Riesto | Actions

        return students;

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