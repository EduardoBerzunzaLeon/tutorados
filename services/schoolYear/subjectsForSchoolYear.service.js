
class SubjectsForSchoolYearService {
    constructor({
        FailedSubjectsRepository,
        CurrentSubjectsRepository,
        createAppError,
        features,
    }) {
        this.failedSubjectsRepository = FailedSubjectsRepository;
        this.currentSubjectsRepository = CurrentSubjectsRepository;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
    }

    async loadData(files, currentSchoolYear) {
        if(files.length != 2) {
            throw this.createAppError('El archivo de bajas y nueva carga academica son requeridos', 500);
        }

        const [ failureSubjects, newSubjectsTaked ] = files;
        const decodedFailure = Buffer.from(failureSubjects.buffer, 'base64').toString();
        const decodedNew = Buffer.from(newSubjectsTaked.buffer, 'base64').toString();

        const { oldShoolYear, newSchoolYear } = this.getCorrectSchoolYear(currentSchoolYear);        
        const failedSubjects = this.convertStringToObject(decodedFailure, oldShoolYear);
        const currentSubjects = this.convertStringToObject(decodedNew, newSchoolYear);

        await Promise.all([
            this.failedSubjectsRepository.create(failedSubjects, { validateBeforeSave: false }),
            this.currentSubjectsRepository.create(currentSubjects, { validateBeforeSave: false })
        ]);

        return {
            ok: true,
            message: 'data loaded'
        }
    }

    getCorrectSchoolYear(currentSchoolYear) {

        const { period, secondPhase } = currentSchoolYear;
        const schoolYear = {
            oldShoolYear: {
                period,
                phase: 1
            },
            newSchoolYear: {
                period,
                phase: 2
            }
        };

        if(secondPhase.status === 'generado') {
            schoolYear.oldShoolYear.phase = 2;
            schoolYear.newSchoolYear.phase = 1;
            schoolYear.newSchoolYear.period = { start: period.end, end: period.end + 1 };
        }

        return schoolYear;
    }

    convertStringToObject(str, schoolYear) {

        const arrayOfRows = str.split('\r\n');

        return arrayOfRows.map(row => {

            const columns = row.split(',');
            if(columns.length > 2) {
                throw this.createAppError('El archivo cargado no tiene la estructura requerida', 500);
            }

            const [ enrollment, subject ] = columns;
            return  {
                schoolYear,
                enrollment,
                subject,
            }

        });

    }

    findFailedSubjectsError( oldSchoolYear ) {

        // TODO: Implements find failed subjects error
    }

    findCurrentSubjectsError( newSchoolYear ) {

        // TODO: Implements find current subjects error
    }

}

module.exports = SubjectsForSchoolYearService;