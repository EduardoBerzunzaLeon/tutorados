class SubjectDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
    }
  
    single = (resource) => ({
      id: resource._id,
      currentSemester: resource?.currentSemester,
      classroom: resource?.classroom,
      atRisk: resource?.atRisk,
      inChannelling: resource?.inChannelling,
      enrollment: resource?.enrollment,
      professorsHistory: resource?.professorsHistory,
      statusHistory: resource?.statusHistory,
      subjectHistory: resource?.subjectHistory,
      user: {
        id: resource?.user.id,
        avatar: resource?.user.avatar && this.getCompleteURLAvatar(resource.user.avatar),
        name: {
          first: this.ucwords(resource.user.name.first),
          last: this.ucwords(resource.user.name.last),
        },
        fullname: `${resource.user.name.first} ${resource.user.name.last}`,
        email: resource?.user.email,
        gender: resource?.user.gender,
      },
    });
  
    singleHistory = (resource) => ({
      id: resource._id,
      subjects: resource?.subjects,
    });

    multipleHistory = (resources) => {
      return resources.map((resource) => this.singleHistory(resource));
    };

    singleUnstudy = (resource) => ({
      _id: resource._id,
      practicalHours: resource.practicalHours,
      theoreticalHours: resource.theoreticalHours,
      name: resource.name,
      semester: resource.semester,
      credit: resource.credit,
      core: resource.core,
    });
   
    multipleUnstudy = (resources) => {
      return resources.map((resource) => this.singleUnstudy(resource));
    };
  }
  
  module.exports = SubjectDTO;
  