class SubjectDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
    }
  
    single = (resource) => ({
      id: resource._id,
      student: resource.student,
      subject: resource.subject,
      phase: resource.phase.map(phase => ({
        id: phase._id,
        date: phase.date,
        phaseStatus: phase.phaseStatus,
        semester: phase.semester,
      })),
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
  