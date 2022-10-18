
class SchoolYearService {
    constructor({
        SchoolYearRepository,
        createAppError,
    }) {
        this.schoolYearRepository = SchoolYearRepository;
        this.createAppError = createAppError;
    }

    close() {
        return 'was closed';
    }

    create() {
        const isClosed =  this.close();
        return {
            isClosed,
            isCreate: 'was created'
        }
    }

    findCurrentSchoolYear() {
        return 'is current';
    }
}

module.exports = SchoolYearService;