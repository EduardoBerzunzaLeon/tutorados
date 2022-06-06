const BaseRepository = require('../base.repository');

class SubjectHistoryRepository extends BaseRepository {
  constructor({ SubjectHistoryEntity }) {
    super(SubjectHistoryEntity);
  }
}

module.exports = SubjectHistoryRepository;
