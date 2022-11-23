const { ObjectId } = require('mongoose').Types;

class AcademicCareerService {
    constructor({
        AcademicCareerRepository,
        SubjectHistoryRepository,
        SubjectRepository,
        StudentRepository,
        StudentService,
        SubjectHistoryService,
        SchoolYearService,
        createAppError
    }) {
        this.academicCareerRepository = AcademicCareerRepository;
        this.subjectHistoryRepository = SubjectHistoryRepository;
        this.studentService = StudentService;
        this.schoolYearService = SchoolYearService;
        this.subjectHistoryService = SubjectHistoryService;
        this.studentRepository = StudentRepository;
        this.subjectRepository = SubjectRepository;
        this.createAppError = createAppError;
    }

    addLastChanceRisk({ subject , currentSemester, mode }) {

        const newPhase  = { phaseStatus: 'Por cursar', semester: currentSemester, mode };
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

    addUniqueSubjectRisk( subjects, { currentSemester, amountOfSubjects }) {
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

    isEquivalentSemester( semester, newSemester ) {
        const subtraction = Math.abs(semester - newSemester);
        return  subtraction % 2 === 0;
    }

    calculateSubjects({ subjects, unapprovedSubjects, currentSemester, amountOfSubjects }) {

        const subjectsId = subjects.map(({ _id }) => (_id.toString()));
        const unapprovedSubjectsCopy = [ ...unapprovedSubjects ];
        let count = 0; 
        
        unapprovedSubjects.forEach((subject, idx) => {
        
            const { requiredSubjects, semester } = subject;
            const isEquivalentSemester =  this.isEquivalentSemester(semester, currentSemester);
                        
            if(isEquivalentSemester && semester <= currentSemester ) {
                    
                const hasAllRequiredSubjects = requiredSubjects.every( r => subjectsId.includes(r.toString()));
                
                if(hasAllRequiredSubjects || requiredSubjects.length === 0) {

                    const { phase, atRisk } = this.addLastChanceRisk({ 
                        subject, 
                        currentSemester, 
                        mode: subject.mode ?? 'normal'
                    });

                    amountOfSubjects = this.addUniqueSubjectRisk( subjects, { currentSemester, amountOfSubjects });
                    
                    if(subject.hasModifications) {
                        console.log(subject.hasModifications)
                    }
                    const subjectToPush = {
                        ...subject,
                        phase,
                        semester: currentSemester,
                        atRisk,
                        hasModifications: Boolean(subject.hasModifications)
                    }
                    
                    subjects.push(subjectToPush);
                    unapprovedSubjectsCopy.splice(idx - count, 1);
                    count ++;
                }
            }
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

    adjustBySemester(subjects) {

        const subjectsTree = subjects.reduce(( acc, { subject, semester, phase, atRisk } ) => {
            const key  = semester - 1;
            const { _id, name } = subject;

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

        return subjectsTree.filter(element => element);
    }

    async getApprovedSubjects(userId) {

        const approvedSubjects = await this.subjectHistoryRepository.entity.aggregate([
            { $match: { student: userId }},
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

        return approvedSubjects.reduce((acc, { subject }) => {
            acc.subjects.push(subject);
            acc.ids.push(subject._id);
            return acc;
        }, { subjects: [], ids: [] });
    }

    async getUnapprovedSubjects(userId, ids) {
        return await this.subjectRepository.entity.aggregate([
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
                        { $match: { student: userId }},
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
    }

    async createAcademicCareer({
        subjects,
        unapprovedSubjects,
        currentSemester,
        subjectsInSemester, 
        canAdvanceSubject,  
        hasValidation,
        authenticatedUser,
        userId
    }) {

        const { subjects: calculatedSubjects } = this.calculateSubjects({ 
            subjects, 
            unapprovedSubjects, 
            currentSemester, 
            amountOfSubjects: 0 
        });

        if(!calculatedSubjects) {
            throw this.createAppError('No se pudo generar la trayectoria academica', 500);
        }

        await this.academicCareerRepository.deleteOne({ student: ObjectId(userId) });

        await this.saveSubjects({
            subjects: calculatedSubjects, 
            subjectsInSemester, 
            canAdvanceSubject,  
            hasValidation,
            authenticatedUser,
            userId
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
        const { currentSemester } = await this.studentService.findStudent(userIdMongo);
        const { subjects, ids } = await this.getApprovedSubjects(userIdMongo);
        const unapprovedSubjects = await this.getUnapprovedSubjects(userIdMongo, ids);

        return await this.createAcademicCareer({
            subjects,
            unapprovedSubjects,
            currentSemester,
            subjectsInSemester, 
            canAdvanceSubject,  
            hasValidation,
            authenticatedUser,
            userId
        });
    }

    async saveSubjects({
        subjects, 
        subjectsInSemester, 
        canAdvanceSubject,  
        hasValidation,
        processStatus = 'generado',
        authenticatedUser,
        userId,
    }) {

        const preparedSubjects = subjects.map(({ _id, semester, phase, atRisk, hasModifications }) => ({
            subject: _id,
            phase,
            atRisk: atRisk || '',
            semester,
            hasModifications
        }));

        const { _id, currentPhase } =  await this.schoolYearService.findCurrentSchoolYear();

        const dataToSave = {
            student: userId,
            processStatus,
            generationParams: {
                subjectsInSemester,
                hasValidation,
                canAdvanceSubject
            },
            schoolYear: {
                id: _id,
                phase: currentPhase,
            },
            creatorUser: authenticatedUser,
            subjects: preparedSubjects
        };

        const savedSubjects = await this.academicCareerRepository.create(dataToSave);
        return savedSubjects;
    }

    async findById(userId) {

        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('el alumno no valido, favor de verificarlo', 400);
        }

        const userIdMongo = ObjectId(userId);

        const student = await this.studentRepository.findOne({ user: userId }, { 
            path:  'user',
            select: '_id avatar name email gender'
        }).lean();

        if(!student) {
            throw this.createAppError('No se encontro al estudiante', 400);
        }

        const response = {
            ...student.user,
            currentSemester: student.currentSemester,
            enrollment: student.enrollment,
            academicCareer: undefined, 
            unaddedSubjects: [],
        }

        const [ academicCareer ] = await this.academicCareerRepository.entity.aggregate([
            { $match: { student: userIdMongo } },
            { $unwind: { 'path': '$subjects' }},
            { $lookup: {
                from:'subjects',
                localField: 'subjects.subject',
                foreignField: '_id',
                as: 'subjects.subject',
                pipeline: [
                    { $project: { name: 1 } }
                ]
            }},
            { $unwind: { 'path': '$subjects.subject' }},
            {
                '$group': {
                    '_id': '$_id', 
                    'data': {
                        '$push': '$$ROOT'
                    },
                }
            },
            { $project: {
                _id: { $first: '$data._id' },
                createdAt: { $first: '$data.createdAt' },
                generationParams: { $first: '$data.generationParams' },
                creatorUser: { $first: '$data.creatorUser' },
                processStatus: { $first: '$data.processStatus' },
                schoolYear: { $first: '$data.schoolYear' },
                student: { $first: '$data.student' },
                subjects: {
                    $map: {
                        input: '$data.subjects',
                        as: 'subjects',
                        in: {
                                subject: '$$subjects.subject',
                                phase: '$$subjects.phase',
                                atRisk: '$$subjects.atRisk',
                                semester: '$$subjects.semester',
                        }
                    }
                }
            }},
            {
                $lookup: {
                    from: 'users',
                    foreignField: "_id",
                    localField: "creatorUser",
                    pipeline: [ { $project: { _id: 1, name: 1, avatar: 1 }} ],
                    as: "creatorUser"
                },
            },
            { $unwind: "$creatorUser" },
            {
                $lookup: {
                    from: 'schoolyears',
                    foreignField: "_id",
                    localField: "schoolYear.id",
                    pipeline: [ { $project: { _id: 1, period: 1 }} ],
                    as: "schoolYear.id"
                },
            },
            { $unwind: "$schoolYear.id" },
        ]);

        if(!academicCareer) {
            return response;
        }

        const subjectsId = academicCareer.subjects.map(({subject}) => subject._id);
        const unaddedSubjects = await this.subjectRepository.entity.aggregate([{
            $match: { _id: { $nin: subjectsId }}
        }]);

        academicCareer.subjects = this.adjustBySemester( academicCareer.subjects );

        return { ...response, academicCareer, unaddedSubjects };
    }

    async update({ 
        userId, 
        subjectId, 
        newSemester, 
        authenticatedUser,
        mode,
        subjectsInSemester, 
        canAdvanceSubject,  
        hasValidation,
     }) {

        const userIdMongo = ObjectId(userId);
        const { currentSemester } = await this.studentService.findStudent(userIdMongo);

        if(mode === 'intersemestral' && newSemester < currentSemester - 1) {
            throw this.createAppError('El semestre de la materia intersemestral incorrecto', 400);
        }

        if(newSemester < currentSemester && mode !== 'intersemestral') {
            throw this.createAppError('El semestre de la materia no puede ser menor al semestre actual del alumno', 400);
        }

        const subject = await this.subjectRepository.findById(subjectId).lean();

        if(!subject) {
            throw this.createAppError('No se encontro la materia', 400);
        }

        const isEquivalentSemester =  this.isEquivalentSemester(subject.semester, newSemester);

        if(!isEquivalentSemester) {
            throw this.createAppError('El nuevo semestre no es un semestre equivalente', 400);
        }

        const { subjects, ids } = await this.getApprovedSubjects(userIdMongo);

        if(ids.includes(ObjectId(subjectId))) {
            throw this.createAppError('No puede actualizar una materia que ya a sido aprobada o este cursando', 400);
        }
        
        const modifiedSubjects = await this.getSubjectsWithHasModifications(userIdMongo);
        const modifiedSubjectsId = modifiedSubjects.map(({_id}) => _id);

        const unapprovedSubjects = await this.getUnapprovedSubjects(userIdMongo, [...ids, ...modifiedSubjectsId]);

        const subjectIdx = unapprovedSubjects.findIndex(({ _id }) => _id.toString() === subjectId);
        const phase  = unapprovedSubjects[subjectIdx]?.history?.phase;

        if(phase && phase.length > 0) {
            const lastPhase = phase.length > 1 ? phase[phase.length - 1] : phase[0];
            this.subjectHistoryService.validModeBeforeToSave({ 
                phase: lastPhase, 
                mode, 
                semester: newSemester 
            });
        }

        unapprovedSubjects[subjectIdx].semester = newSemester;
        unapprovedSubjects[subjectIdx].hasModifications = true;
        unapprovedSubjects[subjectIdx].mode = mode;

        return await this.createAcademicCareer({
            subjects: [...subjects, ...modifiedSubjects],
            unapprovedSubjects,
            currentSemester,
            subjectsInSemester, 
            canAdvanceSubject,  
            hasValidation,
            authenticatedUser,
            userId
        });

    }

    async getSubjectsWithHasModifications(userId) {
        const data = await this.academicCareerRepository.entity.aggregate([
            { $match: { student: userId }},
            { $unwind: '$subjects' },
            { $match: { 'subjects.hasModifications': true }},
            { $lookup: {
                from:'subjects',
                localField: 'subjects.subject',
                foreignField: '_id',
                as: 'subjects.subject',
                pipeline: [
                    { $project: { name: 1, requiredSubjects: 1 } }
                ]
            }},
            { $unwind: { 'path': '$subjects.subject' }},
            {
                $project: {
                    _id: 0,
                    subjects: 1
                }
            }
        ]);

        return data.map(({ subjects }) => {
            const { subject, ...rest } = subjects;
            return {
                ...rest,
                _id: subject._id,
                name: subject.name,
                requiredSubjects: subject.requiredSubjects
            }
        });
     }

    async findDataToExcel(userId) {
  
        if(!ObjectId.isValid(userId)) {
            throw this.createAppError('el alumno no valido, favor de verificarlo', 400);
        }

        const userIdMongo = ObjectId(userId);

        const [ academicCareer ] = await this.academicCareerRepository.entity.aggregate([
            { $match: { student: userIdMongo } },
            { $unwind: { 'path': '$subjects' }},
            { $lookup: {
                from:'subjects',
                localField: 'subjects.subject',
                foreignField: '_id',
                as: 'subjects.subject',
                pipeline: [
                    { $project: { name: 1 } }
                ]
            }},
            { $unwind: { 'path': '$subjects.subject' }},
            {
                '$group': {
                    '_id': '$_id', 
                    'subjects': {
                        '$push': '$subjects'
                    },
                }
            },
            {
                $project: {
                    subjects: {
                        $map: {
                            input: '$subjects',
                            as: 'subjects',
                            in: {
                                subject: '$$subjects.subject.name',
                                atRisk: '$$subjects.atRisk',
                                semester: '$$subjects.semester',
                                firstPhase: {
                                    $let: {
                                        vars: {
                                           fstCustomer: { $arrayElemAt: [ '$$subjects.phase', 0 ] }                
                                        },
                                        in: { $concat: [
                                            '$$fstCustomer.phaseStatus', 
                                            ' en el semestre ' , 
                                            { $convert: { input: '$$fstCustomer.semester', to: 'string' }}
                                        ]}
                                     },
                                },
                                firstPhaseMode: {
                                    $let: {
                                        vars: { element: { $arrayElemAt: [ '$$subjects.phase', 0 ]}},
                                        in: '$$element.mode'
                                    }
                                },
                                secondPhase: {
                                    $let: {
                                        vars: {
                                           fstCustomer: { $arrayElemAt: [ '$$subjects.phase', 1 ] }                
                                        },
                                        in: { $concat: [
                                            '$$fstCustomer.phaseStatus', 
                                            ' en el semestre ' , 
                                            { $convert: { input: '$$fstCustomer.semester', to: 'string' }}
                                        ]}
                                     },
                                },
                                secondPhaseMode: {
                                    $let: {
                                        vars: { element: { $arrayElemAt: [ '$$subjects.phase', 1 ]}},
                                        in: '$$element.mode'
                                    }
                                },
                                thirdPhase: {
                                    $let: {
                                        vars: {
                                           fstCustomer: { $arrayElemAt: [ '$$subjects.phase', 2 ]}                
                                        },
                                        in: { $concat: [
                                            '$$fstCustomer.phaseStatus', 
                                            ' en el semestre ' , 
                                            { $convert: { input: '$$fstCustomer.semester', to: 'string' }}
                                        ]}
                                     },
                                },
                                thirdPhaseMode: {
                                    $let: {
                                        vars: { element: { $arrayElemAt: [ '$$subjects.phase', 2 ]}},
                                        in: '$$element.mode'
                                    }
                                },
                            }
                        }
                    }
                }
            }
        ]);

        if(!academicCareer.subjects) {
            throw this.createAppError('No se encontro la trayectoria academica, favor de generarla', 400);
        }

        return  academicCareer.subjects;

    }

}

module.exports = AcademicCareerService;