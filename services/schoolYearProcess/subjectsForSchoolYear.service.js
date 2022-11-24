
class SubjectsForSchoolYearService {
    constructor({
        createAppError,
        features,
        CurrentSubjectsService,
        FailedSubjectsService,
        IntersemestralSubjectsService,
        FeaturesSchoolYearService,
        StudentService,
        SubjectHistoryService,
    }) {
        this.createAppError = createAppError;
        this.decodeFile = features.decodeFileToString;
        this.currentSubjectsService = CurrentSubjectsService;
        this.failedSubjectsService = FailedSubjectsService;
        this.intersemestralSubjectsService = IntersemestralSubjectsService;
        this.featuresService = FeaturesSchoolYearService;
        this.studentService = StudentService;
        this.subjectHistoryService = SubjectHistoryService;
    }

    async loadData(files, currentSchoolYear) {

        if(files.length != 2) {
            throw this.createAppError('El archivo de materias reprobadas y nueva carga academica son requeridos', 500);
        }

        const { oldSchoolYear, newSchoolYear } = this.featuresService.getCorrectSchoolYear(currentSchoolYear);        
        const [ failureSubjectsFile, newSubjectsFile, interSubjectsFile ] = files;

        await Promise.all([
            this.featuresService.loadData({ 
                schoolYear: oldSchoolYear, 
                file: failureSubjectsFile,
                service: this.failedSubjectsService,
                cb: this.featuresService.genericCallBack
            }),
            this.featuresService.loadData({ 
                schoolYear: newSchoolYear, 
                file: newSubjectsFile,
                service: this.currentSubjectsService,
                cb: this.featuresService.genericCallBack
            }),
            this.featuresService.loadData({ 
                schoolYear: oldSchoolYear, 
                file: interSubjectsFile,
                service: this.intersemestralSubjectsService,
                cb: this.intersemestralSubjectsService.prepareObject,
                isEmptyAllowed: true
            }),
        ]);

        await this.studentService.increaseSemester();

        const subjectPromises = [
            this.failedSubjectsService.updateHistory({ ...oldSchoolYear }),
            this.currentSubjectsService.updateHistory({ ...newSchoolYear }),
        ]

        if(interSubjectsFile) {
           subjectPromises.push(this.intersemestralSubjectsService.updateHistory({ ...oldSchoolYear })) 
        }

        await Promise.all(subjectPromises);
    }

}

module.exports = SubjectsForSchoolYearService;