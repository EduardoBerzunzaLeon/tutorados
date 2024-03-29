const { Admin, Professor, Reader, Student, Mentor } = require("./roles");


const USER_PERMISSIONS = {
    get_users:  [Admin, Reader],
    delete_users: [Admin],
    update_users: [Admin],
    create_users: [Admin],
}

const PROFESSOR_PERMISSIONS = {
    get_professors:  [Admin, Reader],
    delete_professors: [Admin],
    update_professors: [Admin],
    create_professors: [Admin],
}

const STUDENT_PERMISSIONS = {
    get_students:  [Admin, Reader],
    delete_students: [Admin],
    update_students: [Admin],
    create_students: [Admin],
}

const SUBJECT_PERMISSIONS = {
    get_subjects:  [Admin, Reader, Professor],
    delete_subjects: [Admin],
    update_subjects: [Admin],
    create_subjects: [Admin],
}

const COURSE_PERMISSIONS = {
    get_courses:  [Admin, Reader, Professor],
    delete_courses: [Admin, Professor],
    update_courses: [Admin, Professor],
    create_courses: [Admin, Professor],
}

const SUBJECT_HISTORY_PERMISSIONS = {
    get_subject_history:  [Admin, Reader, Professor],
    delete_subject_history: [Admin, Professor],
    update_subject_history: [Admin, Professor],
    create_subject_history: [Admin, Professor],
}

const ACADEMIC_CAREER_PERMISSIONS = {
    get_academic_career:  [Admin, Reader, Professor],
    delete_academic_career: [Admin, Professor],
    update_academic_career: [Admin, Professor],
    create_academic_career: [Admin, Professor],
}

const SCHOOL_YEAR_PERMISSIONS = {
    get_school_year:  [Admin, Reader, Professor],
    delete_school_year: [Admin, Professor],
    update_school_year: [Admin, Professor],
    create_school_year: [Admin, Professor],
}

const SEED_PERMISSIONS = {
    load_seeds: [Admin]
}

const PERMISSIONS_LIST = {
    user: USER_PERMISSIONS,
    professor: PROFESSOR_PERMISSIONS,
    student: STUDENT_PERMISSIONS,
    subject: SUBJECT_PERMISSIONS,
    course: COURSE_PERMISSIONS,
    seed: SEED_PERMISSIONS,
    subjectHistory: SUBJECT_HISTORY_PERMISSIONS,
    academicCareer: ACADEMIC_CAREER_PERMISSIONS,
    schoolYear: SCHOOL_YEAR_PERMISSIONS,
}

module.exports = PERMISSIONS_LIST;