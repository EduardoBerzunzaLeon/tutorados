const BaseRepository = require('../base.repository');

class UserRepository extends BaseRepository {
  constructor({ UserEntity }) {
    super(UserEntity);
  }
}

module.exports = UserRepository;
