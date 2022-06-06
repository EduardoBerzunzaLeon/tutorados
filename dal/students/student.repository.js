const BaseRepository = require('../base.repository');

class StudentRepository extends BaseRepository {
  constructor({ StudentEntity }) {
    super(StudentEntity);
  }
}

module.exports = StudentRepository;
