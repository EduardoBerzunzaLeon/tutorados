class ProfessorDTO {

    constructor({ features }) {
      this.ucwords = features;
    }
    
    getCompleteURLAvatar = (avatar) => (avatar.startsWith('http')) 
      ? avatar 
      : `${process.env.PATH_STATIC_FILES}${avatar}`;
  
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
      avatar: resource?.avatar && this.getCompleteURLAvatar(resource?.avatar),
      courses: resource?.courses || []
    });
  
    singleExcel = (professor) => ({
      id: professor._id,
      name: `${this.ucwords(professor.name.first)} ${this.ucwords(professor.name.last)}`,
      email: professor?.email,
      gender: professor?.gender,
      active: professor.active ? 'Activo' : 'Inactivo',
      createdAt: professor?.createdAt,
      subjects: professor?.subjects,
      courses: professor?.courses || ''
    });

    singleFullName = (professor) => ({
      id: professor._id,
      fullName: professor.fullName,
      avatar: professor?.avatar && this.getCompleteURLAvatar(professor?.avatar),
    })

    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
    
    multipleExcel = (resources) => {
      return resources.map((resource) => this.singleExcel(resource));
    };
    
    multipleFullName = (resources) => {
      return resources.map((resource) => this.singleFullName(resource));
    };
  }
  
  module.exports = ProfessorDTO;
  