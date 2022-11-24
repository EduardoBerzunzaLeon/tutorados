const BaseRepository = require('../base.repository');

class IntersemestralSubjectsRepository extends BaseRepository {
  constructor({ IntersemestralSubjectsEntity }) {
    super(IntersemestralSubjectsEntity);
  }
}

module.exports = IntersemestralSubjectsRepository;
