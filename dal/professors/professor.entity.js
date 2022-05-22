const { Schema, model } = require('mongoose');
const validator = require('validator');

const validGenders = {
    values: ['M', 'F'],
    message: '{VALUE} no es un género válido',
  };

const professorSchema = new Schema({
  name: {
      first: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        lowercase: true,
      },
      last: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true,
        lowercase: true,
      },
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, 'El email es obligatorio'],
      validate: [validator.isEmail, 'Porfavor ingresa un correo valido'],
    },
    avatar: {
      type: String,
      default: 'default.jpg',
    },
    gender: {
      type: String,
      enum: validGenders,
      required: [true, 'El género es obligatorio'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
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

professorSchema.index( { "$**": "text" } );
module.exports = model('Professor', professorSchema);