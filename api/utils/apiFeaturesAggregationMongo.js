class ApiFeaturesAggregationMongo {

    constructor(params, aggregation, globalFields) {
        this.params = params;
        this.aggregation = aggregation;
        this.globalFields = globalFields;
    }

    filter() {
        const queryObj = { ...this.params };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'sortOrder', 'global'];
        
        excludedFields.forEach((el) => {
            delete queryObj[el];
          });

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
            .replaceAll('-', '.');

        const queryFind =  JSON.parse(queryStr);

        if(this.globalFields && this.globalFields.length > 0) {
            this.globalFields.forEach(({field, type}) => {
                if (type === 'number' && !isNaN(queryFind[field])) {
                    queryFind[field] = Number(queryFind[field]);
                    return;
                }
                if (  
                    type === 'string' 
                    && `${field}` in queryFind
                    && '$regex' in queryFind[field]
                ) {
                    const value = queryFind[field]['$regex'];
                    const regex = new RegExp(value, 'i');
                    queryFind[field]['$regex'] = regex;
                    return;
                }
            });
        }

        if(Object.keys(queryFind).length > 0) {
            this.aggregation.push({
                $match: {...queryFind}
            }); 
        }

        return this;
    }

    filterGlobal() {

        if(this.params.global && this.globalFields) {
            const { regex } = this.params.global;
            const globalFilterParams =  this.globalFields.reduce((acc, current) => {
                const {field, type} = current;
    
                if(type === 'string') {
                    return [...acc, {[field]: { $regex: regex, $options: 'i'}}];
                }
    
                if(type === 'number' && !isNaN(regex)) {
                    return [...acc, {[field]: Number(regex)} ];
                }
                return acc;
            }, []);

            if(Object.keys(globalFilterParams).length > 0) {
                this.aggregation.push({
                    $match: { $or: [...globalFilterParams]}
                }); 
            }
        }
        return this;
    }

    sort() {
        if (this.params.sort) {
            const sortBy = this.params.sort.split(',');
            const sortParams = sortBy.reduce((prev, current) => (Object.keys(prev).length === 0 && Object.getPrototypeOf(prev) === Object.prototype)
            ? { [current]: Number(this.params.sortOrder) || 1 }
            : {...prev, [current]: 1}, {});
            this.aggregation.push({ $sort: {...sortParams} });
        }
        return this;
    }

    paginate() {
        const page = this.params.page * 1 || 1;
        const limit = this.params.limit * 1;        
        const data = isNaN(limit) ? [] : [ { $skip: (page - 1) * limit }, { $limit: limit } ]

        const paginateObj =  { '$facet' : {
                metadata: [ { $count: "total" }, { $addFields: { page } } ],
                data
            }};

        this.aggregation.push({...paginateObj});

        return this;
    }

}


module.exports = ApiFeaturesAggregationMongo;