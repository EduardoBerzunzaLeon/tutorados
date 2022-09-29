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
        let count = 0;

        const unapprovedSubjectsCopy = [ ...unapprovedSubjects ];
         
        unapprovedSubjects.forEach((subject, idx) => {
            
            const {  requiredSubjects, semester } = subject;

            const subtraction = Math.abs(semester - currentSemester);
            const isEquivalent =  subtraction % 2 === 0;

            if(isEquivalent && semester <= currentSemester ) {
                
                const hasRequiredSubjects = requiredSubjects.every( r => subjectsId.includes(r.toString()));
                
                if(hasRequiredSubjects || requiredSubjects.length === 0) {
                    const newPhase  = { phaseStatus: 'Por cursar' };

                    const phase = subject?.history?.phase 
                      ? [ ...subject.history.phase, newPhase]
                      : [newPhase];

                    const subjectToPush = {
                        ...subject,
                        phase
                    }

                    subjects.push(subjectToPush);
                    unapprovedSubjectsCopy.splice(idx - count, 1);
                    count ++;
                }
            }
        });


        if(currentSemester === 13 || unapprovedSubjectsCopy.length === 0 ) {
            return subjects;
        }

    
        return this.calculateSubjects({ subjects, unapprovedSubjects: unapprovedSubjectsCopy, currentSemester: currentSemester + 1 });

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

        const { currentSemester } = student;

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
                    subject: {
                        _id: '$subjectDetail._id',
                        requiredSubjects: '$subjectDetail.requiredSubjects',
                        name: '$subjectDetail.name',
                        semester: '$subjectDetail.semester',
                        phase: '$phase'
                    }
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
            {
                $lookup:{
                    from: 'subjecthistories',
                    foreignField: 'subject',
                    localField: '_id',
                    pipeline: [
                        { $match: { student: userIdMongo }},
                    ],
                    as: 'history'
                }
            },
            { $project: { 
                _id: 1, 
                requiredSubjects: 1, 
                name: 1, 
                semester: 1, 
                history: { $first: '$history' },
            }} 
        ]);
        // Accommodate depending on whether it is odd or even
        const calculatedSubjects = this.calculateSubjects({ subjects, unapprovedSubjects, currentSemester });
        const adjustedSubjects = this.adjustBySemester( calculatedSubjects );

        // while processing, verify that it has all the requiered subjects

        // if(!Array.isArray(adjustedSubjects)) {
        //     throw this.createAppError('No se pudo generar la trayectoria, favor de intentarlo de nuevo', 400);
        // }
        // when a semester ends, check the amount of subjects
        return adjustedSubjects;
    }

    adjustBySemester ( subjects ) {
        return subjects.reduce(( acc, { _id, name, semester, phase } ) => {
            
            const key  = semester - 1;
            // const semester = acc[current.semester - 1];

            if(!Array.isArray(acc[key])) {
                acc[key] = {
                    key: semester,
                    data: {
                        _id: semester,
                        name: `Semester ${semester}`,
                        phase: ''
                    },
                    children: []
                };
            }

            acc[key]['children'].push({
                key: _id,
                data: {
                    _id,
                    name,
                    phase
                }
            });
            return acc;
            // const key = `semestre-${semester}`;

            // if(!acc[key]) {
            //     acc[key] = [];
            // }

            // acc[key].push({ _id, name, semester });

            // return acc;
        }, []);
    }

    async findByUserId(userId) {

    }

    async deleteByUserId(userId) {

    }

}

module.exports = AcademicCareerService;