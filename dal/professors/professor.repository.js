const BaseRepository = require('../base.repository');

class ProfessorRepository extends BaseRepository {
  constructor({ ProfessorEntity }) {
    super(ProfessorEntity);
  }
}

module.exports = ProfessorRepository;
