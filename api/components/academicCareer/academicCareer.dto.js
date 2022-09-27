class AcademicCareerDTO {

    constructor() {
    }
  
    single = (resource) => resource;

   
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = AcademicCareerDTO;
  