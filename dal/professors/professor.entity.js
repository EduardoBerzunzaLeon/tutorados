const { Schema, model } = require('mongoose');

const professorSchema = new Schema({
  user: {
      type: Schema.ObjectId,
      ref: 'User',
    },
  subjects: [
        {
          type: Schema.ObjectId,
          ref: 'Subject' 
        }
    ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
  
professorSchema.virtual('courses', {
  ref: 'Course',
  foreignField: 'professor',
  localField: '_id'
});

module.exports = model('Professor', professorSchema);