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
          avatar: resource.firstPhase?.avatar && this.getCompleteURLAvatar(resource.firstPhase?.avatar)
        }
      },
      secondPhase: {
        ...resource.secondPhase,
        user: resource.secondPhase.user ?
        {
          ...resource.secondPhase.user,
          avatar: resource.secondPhase?.avatar && this.getCompleteURLAvatar(resource.secondPhase?.avatar)
        } : undefined
      },
      isCurrent: resource.isCurrent,
      beforeSchoolYear: resource.beforeSchoolYear,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    });
  }
  
  module.exports = SchoolYearDTO;
  