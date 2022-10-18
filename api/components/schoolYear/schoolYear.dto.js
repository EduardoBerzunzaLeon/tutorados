class SchoolYearDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
    }
  
    single = (resource) => resource;
  }
  
  module.exports = SchoolYearDTO;
  