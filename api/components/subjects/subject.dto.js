class SubjectDTO {

    constructor({ features }) {
      this.ucwords = features;
    }
  
    single = (resource) => ({
      id: resource._id,
      name: this.ucwords(resource.name),
      semester: resource.semester,
      createdAt: resource.createdAt,
      deprecated: resource?.deprecated,
      deprecatedAt: resource?.deprecatedAt,
      consecutiveSubject: resource?.consecutiveSubject,
      credit: resource.credit,
    });
  
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = SubjectDTO;
  