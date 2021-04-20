const APIFeaturesMongo = require('../api/utils/apiFeaturesMongo');

class BaseRepository {
  constructor(entity) {
    this.entity = entity;
  }

  findAll(queryParams = {}, filterFields = {}) {
    const features = new APIFeaturesMongo(
      this.entity.find(filterFields),
      queryParams
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    return features.query;
  }

  findById(id, popOptions) {
    let query = this.entity.findById(id);
    if (popOptions) query = query.populate(popOptions);
    return query;
  }

  findOne(searchOptions, popOptions) {
    let query = this.entity.findOne(searchOptions);
    if (popOptions) query = query.populate(popOptions);
    return query;
  }

  updateById(id, data) {
    delete data?.createdAt;
    delete data?.updatedAt;
    return this.entity.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  deleteById(id) {
    return this.entity.findByIdAndDelete(id);
  }

  create(data) {
    return this.entity.create(data);
  }

  save(entity, options = {}) {
    return entity.save(options);
  }
}

module.exports = BaseRepository;
