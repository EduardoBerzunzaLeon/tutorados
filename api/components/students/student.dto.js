class StudentDTO {

    constructor({ features }) {
      this.ucwords = features;
    }
    
    getCompleteURLAvatar = (avatar) => (avatar.startsWith('http')) 
      ? avatar 
      : `${process.env.PATH_STATIC_FILES}${avatar}`;
  
    single = (resource) => ({
      id: resource.id,
      name: {
        first: this.ucwords(resource.name.first),
        last: this.ucwords(resource.name.last),
      },
      fullname: `${resource.name.first} ${resource.name.last}`,
      gender: resource?.gender,
      professor: {
        id: resource.professor?._id,
        name: resource.professor?.name,
        avatar: resource.professor?.avatar && this.getCompleteURLAvatar(resource.professor.avatar)
      },
      atRisk: resource?.atRisk,
      enrollment: resource?.enrollment,
      status: resource?.status,
      userId: resource?.userId,
      currentSemester: resource?.currentSemester,
      avatar: resource?.avatar && this.getCompleteURLAvatar(resource?.avatar),
    });


    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
    
  }
  
  module.exports = StudentDTO;
  