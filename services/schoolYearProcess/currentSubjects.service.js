
class FailedSubjectsService {
    constructor({
        createAppError,
        CurrentSubjectsRepository,
        features,
        FeaturesSchoolYearService,
        SubjectHistoryService,
    }) {
        this.createAppError = createAppError;
        this.currentSubjectsRepository = CurrentSubjectsRepository;
        this.decodeFile = features.decodeFileToString;
        this.featuresService = FeaturesSchoolYearService;
        this.subjectHistoryService = SubjectHistoryService;
    }

    async delete( schoolYear ) {
        await this.currentSubjectsRepository.deleteMany({
            'schoolYear.period': schoolYear.period,
            'schoolYear.phase': schoolYear.phase
        });
    }

    async findAndUpdateErrors({ period, phase }) {
        const repository = this.currentSubjectsRepository;
        const params = { period, phase, repository };
        const matchClouse = {
            $or: [ 
                { 'phase': { $exists: true }, 'subjectHistory': { $size: 3 } },
                { 'phase': { $exists: true }, 'phase.phaseStatus': 'aprobado' }
            ]
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

        const subjects = await this.currentSubjectsRepository.entity.aggregate([
            ...this.featuresService.getInitialAggregate({ period, phase }),
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'student.user',
                    as: 'user'
                }
            },
            { $unwind:  '$user' },
        ]);

        if(!subjects) {
            throw this.createAppError('No se encontraron materias para reprobar', 404);
        }

        const subjectsToAdd = subjects.map(({ user, student, subject }) => {

            const newSubject = {
                userId: user._id,
                subjectId: subject._id,
                phaseStatus: 'cursando',
                semester: student.currentSemester
            }

            return this.subjectHistoryService.create(newSubject);
        });

        return await Promise.all(subjectsToAdd);

    }

    async create(data) {
        return await this.currentSubjectsRepository.create(data);
    }

    async findErrors({ period, phase }) {

        const errors = await this.currentSubjectsRepository.entity.aggregate([
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