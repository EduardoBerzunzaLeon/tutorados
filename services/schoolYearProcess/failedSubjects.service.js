
class FailedSubjectsService {
    constructor({
        createAppError,
        FailedSubjectsRepository,
        features,
        FeaturesSchoolYearService,
        SubjectHistoryService,
    }) {
        this.createAppError = createAppError;
        this.decodeFile = features.decodeFileToString;
        this.failedSubjectsRepository = FailedSubjectsRepository;
        this.featuresService = FeaturesSchoolYearService;
        this.subjectHistoryService = SubjectHistoryService;
    }

    async delete( schoolYear ) {
        await this.failedSubjectsRepository.deleteMany({
            'schoolYear.period': schoolYear.period,
            'schoolYear.phase': schoolYear.phase
        });
    }

    async findAndUpdateErrors({ period, phase }) {
        const repository = this.failedSubjectsRepository;
        const params = { period, phase, repository };
        const matchClouse = {
            'phase': { $exists: true },
            'phase.phaseStatus': { $ne: 'cursando' }
        };

        const hasErrorSubjects = await this.featuresService.updateInvalidSubjects({ ...params });
        const hasErrorStudents = await this.featuresService.updateInvalidStudents({ ...params });
        const hasErrorCurrent = await this.featuresService.updateInvalidCurrentSubjects({ 
            ...params, 
            matchClouse, 
            errorMessage: 'Materia no existe en su carga actual' 
        });

        return hasErrorSubjects || hasErrorStudents || hasErrorCurrent;
    }

    async updateHistory({ period, phase }) {

        const subjects = await this.failedSubjectsRepository.entity.aggregate([
            ...this.featuresService.getInitialAggregate({ period, phase }),
            {
                $lookup: {
                    from: "subjecthistories",
                    let: {
                        subjectHis: "$subject._id",
                        studentHis: "$student.user"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                $and: [
                                    { $eq: [ "$subject", "$$subjectHis" ] },
                                    { $eq: [ "$student", "$$studentHis" ] }
                                ]
                                }
                            }
                        }
                    ],
                    as: "subjectHistory"
                    }
            },
            { $unwind: '$subjectHistory' },
            { $addFields: { phase: { $last: '$subjectHistory.phase' } }},
        ]);

        if(!subjects) {
            throw this.createAppError('No se encontraron materias para reprobar', 404);
        }

        const subjectsToAdd = subjects.map(({ phase, student }) => {
            
            // 1 is substracted because the students' current semester was updated before this method
            const phaseToUpdate =  {
                phaseId: phase._id,
                phaseStatus: 'reprobado',
                semester: student.currentSemester - 1,
                date: Date.now()
            }

            return this.subjectHistoryService.updatePhase(phaseToUpdate);
        });
        
        return await Promise.all([ subjectsToAdd ]);

    }

    async create(data) {
        return await this.failedSubjectsRepository.create(data);
    }

    async findErrors({ period, phase }) {

        const errors = await this.failedSubjectsRepository.entity.aggregate([
            {
                $match: {
                    'schoolYear.period': period,
                    'schoolYear.phase': phase,
                    'error': { $exists: true }
                },
            }
        ]);

        return errors;
    }
}

module.exports = FailedSubjectsService;