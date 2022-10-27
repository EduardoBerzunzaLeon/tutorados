const BaseRepository = require('../base.repository');

class CurrentSubjectsRepository extends BaseRepository {
  constructor({ CurrentSubjectsEntity }) {
    super(CurrentSubjectsEntity);
  }
}

module.exports = CurrentSubjectsRepository;
