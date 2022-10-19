const BaseRepository = require('../base.repository');

class FailedSubjectsRepository extends BaseRepository {
  constructor({ FailedSubjectsEntity }) {
    super(FailedSubjectsEntity);
  }
}

module.exports = FailedSubjectsRepository;
