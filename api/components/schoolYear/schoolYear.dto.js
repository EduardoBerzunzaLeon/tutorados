class SchoolYearDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
    }
  
    single = (resource) => ({
      id: resource._id,
      firstPhase: {
        ...resource.firstPhase,
        user: {
          ...resource.firstPhase.user,
          avatar: resource.firstPhase?.user.avatar && this.getCompleteURLAvatar(resource.firstPhase?.user.avatar)
        }
      },
      secondPhase: {
        ...resource.secondPhase,
        user: resource.secondPhase.user ?
        {
          ...resource.secondPhase.user,
          avatar: resource.secondPhase?.user.avatar && this.getCompleteURLAvatar(resource.secondPhase?.user.avatar)
        } : undefined
      },
      isCurrent: resource.isCurrent,
      beforeSchoolYear: resource.beforeSchoolYear,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      period: resource.period,
      currentSubjectsErrors: resource.currentSubjectsErrors,
      failedSubjectsErrors: resource.failedSubjectsErrors,
    });
  }
  
  module.exports = SchoolYearDTO;
  