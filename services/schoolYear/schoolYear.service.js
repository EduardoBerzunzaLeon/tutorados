
class SchoolYearService {
    constructor({
        SchoolYearRepository,
        SubjectsForSchoolYearService,
        createAppError,
        features,
    }) {
        this.schoolYearRepository = SchoolYearRepository;
        this.subjectsForSchoolYearService = SubjectsForSchoolYearService;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
    }

    async close(authenticatedUser) {
        const phaseUpdated = await this.schoolYearRepository.updateOne(
            { isCurrent: true },
            { "$set": { 
                "secondPhase.status": 'generado',
                "secondPhase.createdAt": Date.now(),
                "secondPhase.user": authenticatedUser
            }}
        );

        if(phaseUpdated.n <= 0) {
            throw this.createAppError('No se pudo actualizar el cilo escolar', 500);
        }
    }

    async addNewSchoolYear({ authenticatedUser, period, _id }) {
        const schoolYearUpdated = await this.schoolYearRepository.updateOne(
            { isCurrent: true },
            { isCurrent: false }
        );
        
        if(schoolYearUpdated.n <= 0) {
            throw this.createAppError('No se pudo actualizar el cilo escolar', 500);
        }
        
        const schoolYearCreated = await this.schoolYearRepository.create(
            { 
                isCurrent: true,
                firstPhase: {
                    user: authenticatedUser,
                    status: 'generado',
                    createdAt: Date.now()
                },
                secondPhase: {
                    status: 'sin generar'
                },
                period: {
                    start: period.end,
                    end: period.end + 1
                },
                beforeSchoolYear: _id,
            },
        );

        if(!schoolYearCreated) {
            throw this.createAppError('No se pudo actualizar el cilo escolar', 500);
        }
    }

    async create({ authenticatedUser, files }) {
    

        const current = await this.schoolYearRepository.findOne({ isCurrent: true }).lean();

        if(!current) {
            throw this.createAppError('No se encontro un ciclo escolar vigente', 404);
        }

        this.subjectsForSchoolYearService.loadData(files, current);

        // if( current.secondPhase.status === 'no generado' ) {
        //     await this.close(authenticatedUser);
        // } else {
        //     const { period, _id } = current;
        //     await this.addNewSchoolYear({ authenticatedUser, period, _id });
        // }
    }

    async findCurrentSchoolYear() {

        const [ currentSchoolYear ] = await this.schoolYearRepository.entity.aggregate([
            { $match: { isCurrent: true } },
            {
                $lookup: {
                    from: 'users',
                    foreignField: "_id",
                    localField: "firstPhase.user",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            avatar: 1,
                            name: 1,
                            email: 1
                        }
                    }],
                    as: "firstPhase.user"
                },
            },
            { $unwind: '$firstPhase.user'},
            {
                $lookup: {
                    from: 'users',
                    foreignField: "_id",
                    localField: "secondPhase.user",
                    pipeline: [{
                        $project: {
                            _id: 1,
                            avatar: 1,
                            name: 1,
                            email: 1
                        }
                    }],
                    as: "secondPhase.user"
                },
            },
            { $unwind: { path: "$secondPhase.user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'schoolyears',
                    foreignField: "_id",
                    localField: "beforeSchoolYear",
                    pipeline: [{
                        $project: {
                            period: 1
                        }
                    }],
                    as: "beforeSchoolYear"
                },
            },
            { $unwind: '$beforeSchoolYear'},
            {
                $project: {
                    _id: 1,
                    firstPhase: 1,
                    secondPhase: {
                        createdAt: 1,
                        status: 1,
                        user: 1,
                    },
                    isCurrent: 1,
                    beforeSchoolYear: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if(!currentSchoolYear || this.isEmpty(currentSchoolYear)) {
            throw this.createAppError('No se encontro el ciclo escolar', 404);
        }

        return currentSchoolYear;
    }
}

module.exports = SchoolYearService;