
class SubjectsForSchoolYearService {
    constructor({
        FailedSubjectsRepository,
        CurrentSubjectsRepository,
        createAppError,
        features,
    }) {
        
        this.FailedSubjectsRepository = FailedSubjectsRepository;
        this.CurrentSubjectsRepository = CurrentSubjectsRepository;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
    }

    loadData(files) {
        if(files.length != 2) {
            throw this.createAppError('El archivo de bajas y nueva carga academica son requeridos', 500);
        }
        const [ failureSubjects, newSubjectsTaked ] = files;
        const decodedFailure = Buffer.from(failureSubjects.buffer, 'base64').toString('ascii');
        const decodedNew = Buffer.from(newSubjectsTaked.buffer, 'base64').toString('ascii');

        return {
            ok: true,
            message: 'data loaded'
        }
    }

}

module.exports = SubjectsForSchoolYearService;