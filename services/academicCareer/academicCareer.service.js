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

    addLastChanceRisk({ subject , currentSemester }) {

        const newPhase  = { phaseStatus: 'Por cursar', semester: currentSemester };
        const subjectPhase = subject?.history?.phase;
        let atRisk = '';
        let phase = [newPhase];

        if(subjectPhase) {
            phase = [ ...subjectPhase, newPhase];
            if(phase.length >= 3) {
                atRisk = 'Ultimo intento.';
            }
        }

        return { atRisk, phase };

    }

    addUniqueSubjectRisk ( subjects, { currentSemester, amountOfSubjects }) {
        const position = subjects.length - 1;
        const lastSemester = subjects.length > 0 
            ? subjects[position].semester
            : currentSemester;
            
        if(lastSemester === currentSemester) {
            amountOfSubjects ++;
        } else {
            if(amountOfSubjects === 1) {
                subjects[position].atRisk += 'Unica materia.'; 
            }
            amountOfSubjects = 1;
        }

        return amountOfSubjects;
    }

    calculateSubjects({ subjects, unapprovedSubjects, currentSemester, amountOfSubjects }) {

        const subjectsId = subjects.map(({ _id }) => (_id.toString()));
        const unapprovedSubjectsCopy = [ ...unapprovedSubjects ];
        let count = 0; 
         
        unapprovedSubjects.some((subject, idx) => {
            
            const {  requiredSubjects, semester } = subject;

            const subtraction = Math.abs(semester - currentSemester);
            const isEquivalentSemester =  subtraction % 2 === 0;

            if(isEquivalentSemester && semester <= currentSemester ) {
                
                const hasAllRequiredSubjects = requiredSubjects.every( r => subjectsId.includes(r.toString()));
                    // return subjects.some((s) => {
                    //     return r.toString() === s._id.toString() && s.semester < currentSemester
                    // });
                    // return subjectsId.includes(r.toString())
                // });
                
                if(hasAllRequiredSubjects || requiredSubjects.length === 0) {

                    const { phase, atRisk } = this.addLastChanceRisk({ subject, currentSemester });

                    amountOfSubjects = this.addUniqueSubjectRisk( subjects, { currentSemester, amountOfSubjects });
                    
                    const subjectToPush = {
                        ...subject,
                        phase,
                        semester: currentSemester,
                        atRisk,
                    }
                    
                    subjects.push(subjectToPush);
                    unapprovedSubjectsCopy.splice(idx - count, 1);
                    count ++;
                }
            }

            return semester > currentSemester;
        });

        if(currentSemester === 13 || unapprovedSubjectsCopy.length === 0 ) {
            return { subjects, unaddedSubjects: unapprovedSubjectsCopy };
        }

    
        return this.calculateSubjects({ 
            subjects, 
            unapprovedSubjects: unapprovedSubjectsCopy, 
            currentSemester: currentSemester + 1,
            amountOfSubjects
         });

    }

    async generate({ 
        subjectsInSemester, 
        canAdvanceSubject, 
        hasValidation, 
        userId, 
        authenticatedUser
    }) {

        const userIdMongo = ObjectId(userId);
        const student = await this.studentRepository.findOne({ user: userIdMongo }).lean();
        
        if(!student) {
            throw this.createAppError('No se encontro al estudiante', 400);
        }

        const { currentSemester } = student;

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
            }},
            { $sort: { semester: 1 }}
        ]);

        const { subjects: calculatedSubjects, unaddedSubjects } = this.calculateSubjects({ 
            subjects, 
            unapprovedSubjects, 
            currentSemester, 
            amountOfSubjects: 0 
        });

        if(!calculatedSubjects) {
            throw this.createAppError('No se pudo generar la trayectoria academica', 500);
        }

        const adjustedSubjects = this.adjustBySemester( calculatedSubjects );

        return  { adjustedSubjects, unaddedSubjects } ;
    }

    adjustBySemester ( subjects ) {
        return subjects.reduce(( acc, { _id, name, semester, phase, atRisk } ) => {
            const key  = semester - 1;

            if(!acc[key]) {
                acc[key] = {
                    key: semester,
                    data: {
                        _id: semester,
                        name: `Semester ${semester}`,
                        phase: '',
                        draggable: false,
                        droppable: true,
                    },
                    children: []
                };
            }

            acc[key]['children'].push({
                key: _id,
                data: {
                    _id,
                    name,
                    phase, 
                    atRisk: atRisk ?? '',
                    draggable: true,
                    droppable: false
                }
            });

            return acc;
        }, []);
    }

    async findByUserId(userId) {

    }

    async deleteByUserId(userId) {

    }

}

module.exports = AcademicCareerService;