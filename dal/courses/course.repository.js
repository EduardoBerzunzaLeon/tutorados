const BaseRepository = require('../base.repository');

class CourseRepository extends BaseRepository {
  constructor({ CourseEntity }) {
    super(CourseEntity);
  }
}

module.exports = CourseRepository;
