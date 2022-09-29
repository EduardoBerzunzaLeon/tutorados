class AcademicCareerDTO {

    constructor() {
    }
  
    single = (resource) => resource;
    // single = (resource) => ({
    //   key: resource._id.toString() ,
    //   data: {
    //     subject: `Semestre ${resource.semester}`,
    //     status: '',
    //     step: ''
    //   },
    //   children: resource.subjects.map( ({ subject, phaseStatus, step }) => ({
    //     key: `${subject._id} - ${ resource._id }`,
    //     data: {
    //       subject: subject.name,
    //       status: phaseStatus,
    //       step: step,
    //     },
    //   }))
    // });

   
    multiple = (resources) => {
      return resources.map((resource) => this.single(resource));
    };
  }
  
  module.exports = AcademicCareerDTO;
  