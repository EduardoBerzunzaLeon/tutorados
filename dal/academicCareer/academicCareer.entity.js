const { Schema, model } = require('mongoose');

const validProcessStatus = {
    values: ['generado', 'finalizado'],
    message: '{VALUE} no es un estatus de fase válida'
};

const AcademicCareerSchema = new Schema({
    student: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    processStatus: {
        type: String,
        enum: validProcessStatus,
        lowercase: true,
        required: [true, 'El estatus de proceso es requerida'],
        trim: true,
    },
    generationParams: {
      subjectsInSemester: {
          type: Number,
          default: 6,
          min: 1,
      },
      canAdvanceSubject: {
          type: Boolean,
          default: false
      },
      hasValidation: {
          type: Boolean,
          default: true
      }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    creatorUser: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    semesters: [
        [
            {
                type: Schema.ObjectId,
                ref: 'Subject',
            }
        ] 
    ]
});


module.exports = model('AcademicCareer', AcademicCareerSchema);