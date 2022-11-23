class AcademicCareerDTO {

    constructor({ features }) {
      this.ucwords = features.ucWords;
      this.getCompleteURLAvatar = features.getCompleteURLAvatar;
    }
  
    single = (resource) => ({
      _id: resource._id,
      name: {
        first: this.ucwords(resource.name.first),
        last: this.ucwords(resource.name.last),
      },
      email: resource?.email,
      active: resource?.active,
      gender: resource?.gender,
      avatar: resource?.avatar && this.getCompleteURLAvatar(resource?.avatar),
      currentSemester: resource?.currentSemester,
      enrollment: resource?.enrollment,
      academicCareer: resource.academicCareer ? {
        ...resource.academicCareer,
        creatorUser: {
          createdAt: resource.academicCareer.createdAt,
          name: {
            first: this.ucwords(resource.academicCareer.creatorUser.name.first),
            last: this.ucwords(resource.academicCareer.creatorUser.name.last),
          },
          avatar: resource.academicCareer.creatorUser?.avatar && this.getCompleteURLAvatar(resource.academicCareer.creatorUser?.avatar),
        }
      } : undefined,
      subjects: resource.subjects,
      unaddedSubjects: resource.unaddedSubjects
    });

    
    
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
    
    singleExcel = ({ 
      subject,
      atRisk,
      semester,
      firstPhase,
      secondPhase,
      thirdPhase,
      firstPhaseMode,
      secondPhaseMode,
      thirdPhaseMode
    }) => ({
      subject,
      atRisk,
      semester,
      firstPhase: firstPhase || '',
      firstPhaseMode: firstPhaseMode || '',
      secondPhase: secondPhase || '',
      secondPhaseMode: secondPhaseMode || '',
      thirdPhase: thirdPhase || '',
      thirdPhaseMode: thirdPhaseMode || '',
    });

    multipleExcel = (resources) => {
      return resources.map((resource) => this.singleExcel(resource));
    };
  }
  
  module.exports = AcademicCareerDTO;
  