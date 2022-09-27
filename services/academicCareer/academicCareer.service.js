

class AcademicCareerService {
    constructor({
        AcademicCareerRepository
    }) {
        this.academicCareerRepository = AcademicCareerRepository;
    }


    async generate({ 
        subjectsInSemester, 
        canAdvanceSubject, 
        hasValidation, 
        userId, 
        authenticatedUser
    }) {

        // NOTES: Generate academic career

        // get current semester (even or odd) [System settings]

        // get approved subjects
        // get No approved subjects (failed and unstudy) [With required subjects and semester]

        // Accommodate depending on whether it is odd or even

        // while processing, verify that it has all the requiered subjects

        // when a semester ends, check the amount of subjects

    }

    async findByUserId(userId) {

    }

    async deleteByUserId(userId) {

    }

}
