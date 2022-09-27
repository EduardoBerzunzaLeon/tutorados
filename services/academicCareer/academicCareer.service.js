const { ObjectId } = require('mongoose').Types;

class AcademicCareerService {
    constructor({
        AcademicCareerRepository,
        SubjectHistoryRepository,
        SubjectRepository,
        StudentRepository,
        createAppError
    }) {
        this.academicCareerRepository = AcademicCareerRepository;
        this.subjectHistoryRepository = SubjectHistoryRepository;
        this.studentRepository = StudentRepository;
        this.subjectRepository = SubjectRepository;
        this.createAppError = createAppError;
    }

    calculateSubjects({ subjects, unapprovedSubjects, currentSemester }) {

        const subjectsId = subjects.map(({ _id }) => (_id.toString()));

        unapprovedSubjects.forEach(({ _id, requiredSubjects, name, semester }, idx) => {

            const subtraction = Math.abs(semester - currentSemester);
            const isEquivalent =  subtraction % 2 === 0;
            
            if(isEquivalent && semester <= currentSemester ) {
                
                const hasRequiredSubjects = requiredSubjects.every( r => subjectsId.includes(r.toString()));
                
                if(hasRequiredSubjects || requiredSubjects.length === 0) {
                    subjects.push({ _id, name, semester: currentSemester, requiredSubjects });
                    unapprovedSubjects.splice(idx, 1);
                }
            }
        });

        if(currentSemester === 13 || unapprovedSubjects.length === 0) {
            return subjects;
        }

        // console.log({unapprovedSubjects});

        return this.calculateSubjects({ subjects, unapprovedSubjects, currentSemester: currentSemester + 1 });

    }

    async generate({ 
        subjectsInSemester, 
        canAdvanceSubject, 
        hasValidation, 
        userId, 
        authenticatedUser
    }) {

        // NOTES: Generate academic career
        const userIdMongo = ObjectId(userId);
        // get current semester (even or odd) [System settings]
        const student = await this.studentRepository.findOne({ user: userIdMongo }).lean();
        
        if(!student) {
            throw this.createAppError('No se encontro al estudiante', 400);
        }
        // const { currentSemester } = student;

        // get approved or in-process subjects
        const approvedSubjects = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { student: userIdMongo }},
            { $addFields: { lastPhase: { $last: '$phase' }}},
            {
                $match: {
                    'lastPhase.phaseStatus': { $in: ['aprobado', 'cursando'] }
                }
            },
            {
                $lookup:{
                    from: 'subjects',
                    foreignField: '_id',
                    localField: 'subject',
                    pipeline: [
                        { $match: { 'deprecated': false }},
                        { $project: { _id: 1, requiredSubjects: 1, name: 1, semester: 1 }}
                    ],
                    as: 'subjectDetail'
                }
            },
            {
                $unwind: '$subjectDetail'
            },
            {
                $project: {
                    _id: 1,
                    lastPhase: 1,
                    subject: '$subjectDetail'
                }
            }
        ]);

        const { subjects, ids } =  approvedSubjects.reduce((acc, { subject }) => {
            acc.subjects.push(subject);
            acc.ids.push(subject._id);
            return acc;
        }, { subjects: [], ids: [] });

        // get No approved subjects (failed and unstudy) [With required subjects and semester]
        const unapprovedSubjects = await this.subjectRepository.entity.aggregate([
            { $match: { 
                deprecated: false,
                _id: { $nin: ids }
             }
            },
            { $project: { _id: 1, requiredSubjects: 1, name: 1, semester: 1 }}
        ]);

        
        // Accommodate depending on whether it is odd or even
        const result = this.calculateSubjects({ subjects, unapprovedSubjects, currentSemester: 6 });
        
        console.log({ result });


        // while processing, verify that it has all the requiered subjects

        // when a semester ends, check the amount of subjects

        return [{
            unapprovedSubjects
        }]
    }

    async findByUserId(userId) {

    }

    async deleteByUserId(userId) {

    }

}

module.exports = AcademicCareerService;