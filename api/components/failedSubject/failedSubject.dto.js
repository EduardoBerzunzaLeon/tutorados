class FailedSubjectDTO {

    constructor() {
    }
  
    single = (resource) => ({
      id: resource._id,
      schoolYear: resource.schoolYear,
      enrollment: resource.enrollment,
      subject: resource.subject,
      createdAt: resource.createdAt,
      error: resource.error
    });

    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };

  }
  
  module.exports = FailedSubjectDTO;
  