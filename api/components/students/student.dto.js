class StudentDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
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
      email: resource?.email,
      active: resource?.active,
      gender: resource?.gender,
      professor:  {
        id: resource.professor?._id,
        name: resource.professor?.name,
        avatar: resource.professor?.avatar && this.getCompleteURLAvatar(resource.professor.avatar)
      },
      atRisk: resource?.atRisk,
      inChannelling: resource?.inChannelling,
      enrollment: resource?.enrollment,
      status: resource?.status,
      studentId: resource?.studentId,
      currentSemester: resource?.currentSemester,
      classroom: resource?.classroom,
      avatar: resource?.avatar && this.getCompleteURLAvatar(resource?.avatar),
    });


    setProfessorInHistory = (professor) => ({
      createdAt: professor.createdAt,
      id: professor._id,
      professor: {
        id: professor.professor._id,
        avatar: professor.professor?.avatar && this.getCompleteURLAvatar(professor.professor?.avatar),
        name: {
          first: this.ucwords(professor.professor.name.first),
          last: this.ucwords(professor.professor.name.last),
        }
      },
      comments: professor.comments,
      dischargeAt: professor?.dischargeAt,
      idProfessorBefore: professor?.idProfessorBefore
    })

    singleProfessorsHistory = (student) => ({
      id: student?._id,
      professorsHistory: student?.professorsHistory.map(this.setProfessorInHistory)
    });


    singleByExcel = (resource) => ({
      fullname: `${resource.name.first} ${resource.name.last}`,
      email: resource?.email,
      gender: resource?.gender === 'M' ? 'Hombre' : 'Mujer',
      professorName: `${resource.professor?.name?.first} ${resource.professor?.name?.last}`,
      atRisk: resource?.atRisk,
      inChannelling: resource?.inChannelling,
      enrollment: resource?.enrollment,
      status: resource?.status,
      currentSemester: resource?.currentSemester,
      classroom: resource?.classroom,
    });

    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
    
    multipleByExcel = (resources) => {
      return resources.map((resource) => this.singleByExcel(resource));
    }
    
    
  }
  
  module.exports = StudentDTO;
  