const APIFeaturesMongo = require('../api/utils/apiFeaturesMongo');

class BaseRepository {
  constructor(entity) {
    this.entity = entity;
  }

  async findAll(queryParams = {}, filterFields = {}) {
    const features = new APIFeaturesMongo(
      this.entity.find(filterFields),
      queryParams
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    return await features.query;
  }

  async findById(id, popOptions) {
    let query = this.this.entity.findById(id);
    if (popOptions) query = query.populate(popOptions);
    return await query;
  }

  async findOne(searchOptions, popOptions) {
    let query = this.entity.findOne(searchOptions);
    if (popOptions) query = query.populate(popOptions);
    return await query;
  }

  async updateById(id, data) {
    delete data?.createdAt;
    delete data?.updatedAt;
    return await this.entity.findByIdAndUpdate(id, entity, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await this.entity.findByIdAndDelete(id);
  }

  async create(data) {
    return await this.entity.create([data]);
  }

  async save(entity) {
    return await entity.save({ validateBeforeSave: false });
  }
}

module.exports = BaseRepository;
