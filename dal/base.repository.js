const APIFeaturesMongo = require('../api/utils/apiFeaturesMongo');
const APIFeaturesAggregationMongo = require('../api/utils/apiFeaturesAggregationMongo');

class BaseRepository {
  constructor(entity) {
    this.entity = entity;
  }

  findAll(queryParams = {}, popOptions) {

    const features = new APIFeaturesMongo(queryParams, this.entity.find())
      .filter()
      .sort()
      .limitFields()
      .paginate();

      
    if(popOptions) features.query = features.query.populate(popOptions);

      return [
         this.entity.find(features.queryFind).countDocuments(),
         features.query
      ];
  }
  
  async findAggregation(agregation, params = {}, globalFields = undefined ) {

    const aggregationWithFeatures = new APIFeaturesAggregationMongo(params, agregation, globalFields)
      .filter()
      .filterGlobal()
      .sort()
      .paginate()
      .aggregation;

    const doc = await this.entity.aggregate(aggregationWithFeatures);

    const [ { metadata, data } ] = doc;
    return [ metadata[0]?.total || 0, data ];
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

  updateMany(query, options, more) {
    return this.entity.updateMany(query, options, more);
  }
  
  updateOne(query, update, options) {
    return this.entity.updateOne(query, update, options);
  }

  deleteById(id) {
    return this.entity.findByIdAndDelete(id);
  }

  deleteOne(params) {
    if (!params || (typeof params === 'object' && !Object.keys(params))) {
      return null;
    }
    return this.entity.findOneAndDelete(params);
  }

  deleteAll() {
    return this.entity.deleteMany({});
  }

  create(data) {
    return this.entity.create(data);
  }

  save(entity, options = {}) {
    return entity.save(options);
  }
}

module.exports = BaseRepository;
