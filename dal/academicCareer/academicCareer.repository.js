const BaseRepository = require('../base.repository');

class AcademicCareerRepository extends BaseRepository {
  constructor({ AcademicCareerEntity }) {
    super(AcademicCareerEntity);
  }
}

module.exports = AcademicCareerRepository;
