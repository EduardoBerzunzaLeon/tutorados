class IntersemestralSubjectDTO {

    constructor() {
    }
  
    single = (resource) => ({
      id: resource._id,
      schoolYear: resource.schoolYear,
      enrollment: resource.enrollment,
      subject: resource.subject,
      status: resource.status,
      createdAt: resource.createdAt,
      error: resource.error
    });

    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };

  }
  
  module.exports = IntersemestralSubjectDTO;
  