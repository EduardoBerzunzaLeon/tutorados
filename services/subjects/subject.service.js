const { Types } = require('mongoose');

class SubjectService  {

    constructor({ SubjectRepository, createAppError }) {
        this.subjectRepository = SubjectRepository;
        this.createAppError = createAppError;
    }

    async find(query) {
        return await Promise.all(this.subjectRepository.findAll(query));
    }

    async findById(id) {

        if(!id) {
            throw this.createAppError(
              'El ID es obligatorio',
              400
            );
        }

        

        const [subject] = await this.subjectRepository.entity.aggregate([{ 
            $match: { _id: Types.ObjectId(id) }
         }, 
         {
            $lookup: {
                from: 'subjects',
                foreignField: "_id",
                localField: "consecutiveSubject",
                pipeline: [
                   { $project: { name: 1, deprecated: 1, id: 1 } }
                ],
                as: "consecutiveSubject"
            },
        }, { $unwind: {
            path: "$consecutiveSubject",
            preserveNullAndEmptyArrays: true
        }},
        {
            $lookup: {
                from: 'subjects',
                foreignField: "consecutiveSubject",
                localField: "_id",
                pipeline: [
                    { $project: { name: 1, deprecated: 1 } }
                 ],
                as: "previousSubject"
            },
        }, 
        { $unwind: {
            path: "$previousSubject",
            preserveNullAndEmptyArrays: true
        }}]);

        console.log(subject);
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


