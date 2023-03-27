const fs = require('fs');
const { Types } = require('mongoose');

const { ObjectId } = Types;

class SeedService {
    constructor({ 
      UserRepository, 
      ProfessorRepository, 
      StudentRepository, 
      CourseRepository, 
      SubjectRepository, 
      SubjectHistoryRepository, 
      SchoolYearRepository,
      createAppError,
      getEnviroment
    }) {
        this.userRepository = UserRepository;
        this.professorRepository = ProfessorRepository;
        this.studentRepository = StudentRepository;
        this.courseRepository = CourseRepository;
        this.subjectRepository = SubjectRepository;
        this.subjectHistoryRepository = SubjectHistoryRepository;
        this.schoolYearRepository = SchoolYearRepository;
        this.createAppError = createAppError;
        this.enviroment = getEnviroment;
    }
    
    async loadCollections() {
        
        if( this.enviroment !== 'development') {
            throw this.createAppError('No tiene acceso a este servicio', 401);
        }
            
        await Promise.all([
            this.userRepository.deleteMany(),
            this.professorRepository.deleteMany(),
            this.studentRepository.deleteMany(),
            this.courseRepository.deleteMany(),
            this.subjectRepository.deleteMany(),
            this.subjectHistoryRepository.deleteMany(),
            this.schoolYearRepository.deleteMany(),
        ]);
    
        const users = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')) );
        const professors = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/professors.json`, 'utf-8')) );
        const subjects = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/subjects_complete.json`, 'utf-8')) );
        const students = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/students.json`, 'utf-8')) );
        const courses = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/courses.json`, 'utf-8')) );
        const subjectsHistory = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/subjectHistory.json`, 'utf-8')) );
        const schoolYear = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/schoolYear.json`, 'utf-8')) );

        await this.userRepository.create( users, { validateBeforeSave: false, forceServerObjectId: true });
        await this.subjectRepository.create( subjects, { validateBeforeSave: false });
        await this.professorRepository.create( professors, { validateBeforeSave: false } );
        await this.studentRepository.create( students, { validateBeforeSave: false });
        await this.courseRepository.create( courses, { validateBeforeSave: false });
        await this.subjectHistoryRepository.create( subjectsHistory, { validateBeforeSave: false });
        await this.schoolYearRepository.create( schoolYear, { validateBeforeSave: false });

    }
  
    setToObjectID( element ) {


        if( typeof element !== 'object' && !Array.isArray(element) ) {
            return;           
        }

        let accu = element;

        if( Array.isArray(accu) ) {
            accu.forEach( (e) => {
                this.setToObjectID( e )
            });
        } 

        if ( 
            typeof element === 'object' 
            && element !== null  
            && Object.entries(element).length > 0
        ) {
            Object.keys(element).forEach( key => {

                const value = element[key];

                if(value && Object.keys(value).includes('$oid')) {
                    element[key] =  ObjectId( value['$oid'] );
                }
                
                this.setToObjectID( element[key] );
            });

        } 

        return accu;
    }

  }


  
  module.exports = SeedService;
  