const { Types } = require('mongoose');

class SubjectService  {

    constructor({ SubjectRepository, createAppError }) {
        this.subjectRepository = SubjectRepository;
        this.createAppError = createAppError;
    }

    async find(query) {
        return await Promise.all(this.subjectRepository.findAll(query));
    }

    async findForExcel() {

        return await this.subjectRepository.entity.aggregate([
         {
            $lookup: {
                from: 'subjects',
                foreignField: "_id",
                localField: "requiredSubjects",
                pipeline: [
                    { $match: { deprecated: false }},
                    { $project: { name: 1,  _id: 0 } }
                ],
                as: "requiredSubjects"
            },
        },
        {
            $lookup: {
                from: 'subjects',
                foreignField: "requiredSubjects",
                localField: "_id",
                pipeline: [
                    { $match: { deprecated: false }},
                    { $project: { name: 1,  _id: 0  } }
                 ],
                as: "correlativeSubjects"
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                semester: 1,
                deprecated: 1,
                deprecatedAt: 1,
                createdAt: 1,
                credit: 1,
                practicalHours: 1,
                theoreticalHours: 1,
                core: 1,
                correlativeSubjects: {
                    $reduce: {
                        input: "$correlativeSubjects.name",
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
                requiredSubjects: {
                    $reduce: {
                        input: "$requiredSubjects.name",
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
        }]);

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
                localField: "requiredSubjects",
                pipeline: [
                   { $project: { name: 1, deprecated: 1, id: 1 } }
                ],
                as: "requiredSubjects"
            },
        },
        {
            $lookup: {
                from: 'subjects',
                foreignField: "requiredSubjects",
                localField: "_id",
                pipeline: [
                    { $project: { name: 1, deprecated: 1 } }
                 ],
                as: "correlativeSubjects"
            },
        }]);

        if(!subject) {
            throw this.createAppError(
              'ID incorrecto',
              404
            );
          }
      
        return subject;
    }

    async deleteById(id) {
        const deleted =  await this.subjectRepository.deleteById(id);
        await this.subjectRepository.updateMany(
            { requiredSubjects: Types.ObjectId(id) },
            { $pull: {requiredSubjects:  Types.ObjectId(id)} },
            { multi: true }
        );

        return deleted;
    }

    async create({ 
        name, 
        semester, 
        credit, 
        requiredSubjects,
        practicalHours,
        theoreticalHours,
        core
     }) {

        const subjectExists = await this.subjectRepository.findOne({ name });
        if (subjectExists) throw this.createAppError('Materia ya existe', 401);

        const subjectCreated = await this.subjectRepository.create({
            name,
            semester,
            credit,
            requiredSubjects,
            practicalHours,
            theoreticalHours,
            core
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

    async updateCorrelativeSubjects(id, {correlativeSubjects}) {
        
        const subject = await this.subjectRepository.findById(id);

        if (!subject) {
            throw this.createAppError('No se encontró la materia.', 404);
        }
        
        const  objectIdList = correlativeSubjects.map((id) => Types.ObjectId(id));

        const deleteSubjects = this.subjectRepository.updateMany(
            { requiredSubjects: Types.ObjectId(id), '_id': { $nin: objectIdList } },
            { $pull: {requiredSubjects:  Types.ObjectId(id)} },
            { multi: true }
        );

        const addSubjects = await this.subjectRepository.updateMany({ '_id':  { $in: objectIdList}},
        { $addToSet: {requiredSubjects:  Types.ObjectId(id)}},
        { multi: true });
   
        await Promise.all([deleteSubjects, addSubjects]);

        return subject;
    }

}

module.exports = SubjectService;


