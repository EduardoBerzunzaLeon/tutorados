class ProfessorDTO {

    constructor({ features }) {
      this.ucwords = features;
    }
    
    getCompleteURLAvatar = (avatar) => (avatar.startsWith('http')) 
      ? avatar 
      : `${process.env.PATH_STATIC_FILES}professors/${avatar}`;
  
    single = (resource) => ({
      id: resource._id,
      name: {
        first: this.ucwords(resource.name.first),
        last: this.ucwords(resource.name.last),
      },
      fullname: `${resource.name.first} ${resource.name.last}`,
      gender: resource?.gender,
      email: resource?.email,
      active: resource?.active,
      createdAt: resource?.createdAt,
      subjects: resource?.subjects,
      avatar: this.getCompleteURLAvatar(resource?.avatar),
      courses: resource?.courses || []
    });
  
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = ProfessorDTO;
  