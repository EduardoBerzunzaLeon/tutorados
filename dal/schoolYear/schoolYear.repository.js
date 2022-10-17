const BaseRepository = require('../base.repository');

class SchoolYearRepository extends BaseRepository {
  constructor({ SchoolYearEntity }) {
    super(SchoolYearEntity);
  }
}

module.exports = SchoolYearRepository;
