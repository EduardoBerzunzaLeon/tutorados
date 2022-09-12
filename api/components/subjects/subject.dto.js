class SubjectDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
    }
  
    single = (resource) => {
      const total = resource?.practicalHours + resource?.theoreticalHours;
      const totalHours = isNaN(total) ? undefined : total;
      return {
      id: resource._id,
      name: this.ucwords(resource.name),
      semester: resource.semester,
      createdAt: resource.createdAt,
      deprecated: resource?.deprecated,
      deprecatedAt: resource?.deprecatedAt,
      requiredSubjects: resource?.requiredSubjects,
      correlativeSubjects: resource?.correlativeSubjects,
      credit: resource?.credit,
      practicalHours: resource?.practicalHours,
      theoreticalHours: resource?.theoreticalHours,
      totalHours,
      core: this.ucwords(resource?.core)
    }};
  
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = SubjectDTO;
  