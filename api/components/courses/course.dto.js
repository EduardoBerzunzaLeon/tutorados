class CourseDTO {

    constructor({ features }) {
      this.ucwords = features;
    }
  
    single = (resource) => ({
      id: resource._id,
      name: this.ucwords(resource.name),
      impartedAt: resource.impartedAt,
      professor: resource.professor,
    });
  
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = CourseDTO;
  