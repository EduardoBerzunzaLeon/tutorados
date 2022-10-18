
class SchoolYearService {
    constructor({
        SchoolYearRepository,
        createAppError,
        features,
    }) {
        this.schoolYearRepository = SchoolYearRepository;
        this.createAppError = createAppError;
        this.isEmpty = features.isEmptyObject;
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