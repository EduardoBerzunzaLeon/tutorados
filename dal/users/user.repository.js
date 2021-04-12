const BaseRepository = require('../base.repository');

class UserRepository extends BaseRepository {
  constructor({ UserEntity }) {
    super(UserEntity);
    this._user = UserEntity;
  }
}

module.exports = UserRepository;
