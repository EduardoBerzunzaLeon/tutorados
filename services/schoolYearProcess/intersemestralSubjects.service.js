
class IntersemestralSubjectsService {
    constructor({
        createAppError,
        IntersemestralSubjectsRepository,
        features,
        FeaturesSchoolYearService,
        SubjectHistoryService,
    }) {
        this.createAppError = createAppError;
        this.decodeFile = features.decodeFileToString;
        this.intersemestralSubjectsRepository = IntersemestralSubjectsRepository;
        this.featuresService = FeaturesSchoolYearService;
        this.subjectHistoryService = SubjectHistoryService;
    }

    async delete( schoolYear ) {
        await this.intersemestralSubjectsRepository.deleteMany({
            'schoolYear.period': schoolYear.period,
            'schoolYear.phase': schoolYear.phase
        });
    }

    async findAndUpdateErrors({ period, phase }) {
        const repository = this.intersemestralSubjectsRepository;
        const params = { period, phase, repository };
        const matchClouse = {
            'phase': { $exists: true },
            'phase.phaseStatus': { $eq: 'aprobado' }
        };

        const hasErrorSubjects = await this.featuresService.updateInvalidSubjects({ ...params });
        const hasErrorStudents = await this.featuresService.updateInvalidStudents({ ...params });
        const hasErrorCurrent = await this.featuresService.updateInvalidCurrentSubjects({ 
            ...params, 
            matchClouse, 
            errorMessage: 'Materia no valida' 
        });

        return hasErrorSubjects || hasErrorStudents || hasErrorCurrent;
    }

    async updateHistory({ period, phase }) {

        const subjects = await this.intersemestralSubjectsRepository.entity.aggregate([
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

        const subjectsToAdd = subjects.map(({ phase, student, status }) => {
            const phaseToUpdate =  {
                phaseId: phase._id,
                phaseStatus: status,
                mode: 'intersemestral',
                semester: student.currentSemester - 1,
                date: Date.now()
            }

            return this.subjectHistoryService.updatePhase(phaseToUpdate);
        });
        
        return await Promise.all([ subjectsToAdd ]);

    }

    async create(data) {
        return await this.intersemestralSubjectsRepository.create(data);
    }

    async findErrors(query) {

        const { start, end, status, ...params } = query;

        const { oldSchoolYear } = this.featuresService.getCorrectSchoolYear({ 
            period: { start: Number(start), end: Number(end) }, 
            secondPhase: { status } 
        });

        const aggregation = [
            {
                $match: {
                    'schoolYear.period': oldSchoolYear.period,
                    'schoolYear.phase': oldSchoolYear.phase,
                    'error': { $exists: true }
                },
            },
        ]

        return await this.intersemestralSubjectsRepository.findAggregation(aggregation, params);
    }

    prepareObject(schoolYear, columns) {
        const [ enrollment, subject, passed ] = columns;
        return  {
            enrollment,
            schoolYear,
            passed,
            subject,
        }
    }
}

module.exports = IntersemestralSubjectsService;