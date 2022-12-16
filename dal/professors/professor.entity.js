const { Schema, model } = require('mongoose');

const professorSchema = new Schema({
  user: {
      type: Schema.ObjectId,
      ref: 'User',
    },
  createdAt: {
      type: Date,
      default: Date.now(),
      select: false
  },
  isDefaultProfessor: {
    type: Boolean,
    default: false,
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