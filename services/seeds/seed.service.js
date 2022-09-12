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
      createAppError,
      getEnviroment
    }) {
        this.userRepository = UserRepository;
        this.professorRepository = ProfessorRepository;
        this.studentRepository = StudentRepository;
        this.courseRepository = CourseRepository;
        this.subjectRepository = SubjectRepository;
        this.subjectHistoryRepository = SubjectHistoryRepository;
        this.createAppError = createAppError;
        this.enviroment = getEnviroment;
    }
    
    async loadCollections() {
        
        if( this.enviroment !== 'development') {
            throw this.createAppError('No tiene acceso a este servicio', 401);
        }
            
        await Promise.all([
            this.userRepository.deleteAll(),
            this.professorRepository.deleteAll(),
            this.studentRepository.deleteAll(),
            this.courseRepository.deleteAll(),
            this.subjectRepository.deleteAll(),
            this.subjectHistoryRepository.deleteAll(),
        ]);
        
        // const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')).map( user => ({
        //     ...user,
        //     _id: ObjectId(user._id["$oid"])
        // }));
    

        // const professors = JSON.parse(fs.readFileSync(`${__dirname}/professors.json`, 'utf-8')).map( professor => ({
        //     ...professor,
        //     professor: ObjectId(professor.user),
        //     _id: ObjectId(professor._id),
        //     subjects: professor.subjects.map( subject => ObjectId(subject))
        // }));

        // const subjects = JSON.parse(fs.readFileSync(`${__dirname}/subjects.json`, 'utf-8')).map( subject => ({
        //     ...subject,
        //     _id: ObjectId(subject._id['$oid']),
        //     requiredSubjects: subject.requiredSubjects.map( requiredSubject  => ObjectId(requiredSubject['$oid']))
        // }));


        // const students = JSON.parse(fs.readFileSync(`${__dirname}/students.json`, 'utf-8')).map( student => ({
        //     ...student,
        //     _id: ObjectId(student._id['$oid']),
        //     user: ObjectId(student.user['$oid']),
        //     professorsHistory: student.professorsHistory.map( professor => ({
        //         ...professor,
        //         _id: ObjectId(professor._id['$oid']),
        //         professor: ObjectId(professor.professor['$oid']),
        //     }))
        // }));
        
        // const courses = JSON.parse(fs.readFileSync(`${__dirname}/courses.json`, 'utf-8')).map( course => ({
        //     ...course, 
        //     _id: ObjectId(course._id['$oid']),
        //     professor: ObjectId(course.professor['$oid']),
        // }));
    
        const users = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')) );
        const professors = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/professors.json`, 'utf-8')) );
        const subjects = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/subjects.json`, 'utf-8')) );
        const students = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/students.json`, 'utf-8')) );
        const courses = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/courses.json`, 'utf-8')) );
        const subjectsHistory = this.setToObjectID( JSON.parse(fs.readFileSync(`${__dirname}/subjectHistory.json`, 'utf-8')) );


        await this.userRepository.create( users, { validateBeforeSave: false, forceServerObjectId: true });
        await this.subjectRepository.create( subjects, { validateBeforeSave: false });
        await this.professorRepository.create( professors, { validateBeforeSave: false } );
        await this.studentRepository.create( students, { validateBeforeSave: false });
        await this.courseRepository.create( courses, { validateBeforeSave: false });
        await this.subjectHistoryRepository.create( subjectsHistory, { validateBeforeSave: false });

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

                if(Object.keys(value).includes('$oid')) {
                    element[key] =  ObjectId( value['$oid'] );
                }
                
                this.setToObjectID( element[key] );
            });

        } 

        return accu;
        


    }

  }


  
  module.exports = SeedService;
  