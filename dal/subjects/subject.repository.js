const BaseRepository = require('../base.repository');

class SubjectRepository extends BaseRepository {
  constructor({ SubjectEntity }) {
    super(SubjectEntity);
  }
}

module.exports = SubjectRepository;
