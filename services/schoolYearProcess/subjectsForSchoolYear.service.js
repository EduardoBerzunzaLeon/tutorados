
class SubjectsForSchoolYearService {
    constructor({
        createAppError,
        features,
        CurrentSubjectsService,
        FailedSubjectsService,
        FeaturesSchoolYearService,
        StudentService,
        SubjectHistoryService,
    }) {
        this.createAppError = createAppError;
        this.decodeFile = features.decodeFileToString;
        this.currentSubjectsService = CurrentSubjectsService;
        this.failedSubjectsService = FailedSubjectsService;
        this.featuresService = FeaturesSchoolYearService;
        this.studentService = StudentService;
        this.subjectHistoryService = SubjectHistoryService;
    }

    async loadData(files, currentSchoolYear) {

        if(files.length != 2) {
            throw this.createAppError('El archivo de materias reprobadas y nueva carga academica son requeridos', 500);
        }

        const { oldSchoolYear, newSchoolYear } = this.featuresService.getCorrectSchoolYear(currentSchoolYear);        
        const [ failureSubjectsFile, newSubjectsFile ] = files;

        await Promise.all([
            this.featuresService.loadData({ 
                schoolYear: oldSchoolYear, 
                file: failureSubjectsFile,
                service: this.failedSubjectsService
            }),
            this.featuresService.loadData({ 
                schoolYear: newSchoolYear, 
                file: newSubjectsFile,
                service: this.currentSubjectsService
            })
        ]);

        await this.studentService.increaseSemester();

        await Promise.all([
            this.failedSubjectsService.updateHistory({ period: oldSchoolYear.period, phase: oldSchoolYear.phase }),
            this.currentSubjectsService.updateHistory({ period: newSchoolYear.period, phase: newSchoolYear.phase })
        ]);

    }

}

module.exports = SubjectsForSchoolYearService;