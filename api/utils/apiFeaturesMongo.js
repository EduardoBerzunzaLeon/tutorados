class APIFeaturesMongo {
  constructor(queryString, query) {
    this.queryString = queryString;
    this.query = query;
    this.queryFind = null;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'sortOrder', 'global'];
    excludedFields.forEach((el) => {
      if(el === 'global' && queryObj[el]) {
        queryObj['$text'] = { $search : queryObj[el]?.regex ?? '' };
      }
      delete queryObj[el];
    });

    // convert between into gte and lte
    Object.keys(queryObj).forEach((el) => {
      if(queryObj[el]?.hasOwnProperty('between') ) {
        const [ gte, lte ] = queryObj[el].between.split(',');
        queryObj[el] = {
          gte,
          lte
        }
      }
    });
    

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt|ne|regex|between)\b/g,
      (match) =>  `$${match}`
      )
      .replace('-', '.');

    
    this.queryFind = JSON.parse(queryStr);
    this.query = this.query.find(JSON.parse(queryStr));
      
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',');
      
      const result = (this.queryString.sortOrder) 
        ? sortBy.reduce((prev, current) => (Object.keys(prev).length === 0 && Object.getPrototypeOf(prev) === Object.prototype)
          ? { [current]: this.queryString.sortOrder }
          : {...prev, [current]: 1}, {})
        : sortBy.join(' ');
      
        console.log(result);
      this.query = this.query.sort(result);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeaturesMongo;
