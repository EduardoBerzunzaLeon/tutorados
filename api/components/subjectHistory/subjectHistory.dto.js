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
        mode: phase.mode,
      })),
    });

    singleComplete = (resource) => ({
      ...resource,
      user: {
        ...resource.user,
        fullName: `${resource.user.name.first} ${resource.user.name.last}`,
      }
    });
  
    singleHistory = (resource) => ({
      key: resource._id.toString(),
      data: {
        subject: `Semestre ${resource._id}`,
        status: '',
        step: '',
        mode: '',
      },
      children: resource.subjects.map( ({ subject, phaseStatus, step, mode }) => ({
        key: `${subject._id} - ${ resource._id }`,
        data: {
          subject: subject.name,
          status: phaseStatus,
          step,
          mode
        },
      }))
    });

    multipleHistory = (resources) => {
      return resources.map((resource) => this.singleHistory(resource));
    };

    singleSubject = (resource) => ({
      _id: resource._id,
      practicalHours: resource.practicalHours,
      theoreticalHours: resource.theoreticalHours,
      name: resource.name,
      semester: resource.semester,
      credit: resource.credit,
      core: resource.core,
    });
   
    multipleSubject = (resources) => {
      return resources.map((resource) => this.singleSubject(resource));
    };
  }
  
  module.exports = SubjectDTO;
  