const { Schema, model } = require('mongoose');

const validProcessStatus = {
    values: ['generado', 'finalizado'],
    message: '{VALUE} no es un estatus de fase válida'
};

const validPhaseStatus = {
    values: ['aprobado', 'reprobado', 'cursando', 'por cursar'],
    message: '{VALUE} no es un estatus de fase válida'
};


const academicCareerSchema = new Schema({
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
    schoolYear: {
        id: {
            type: Schema.ObjectId,
            ref: 'SchoolYear' 
        },
        phase: {
            type: Number,
            min: 1,
            max: 2,
            required: [true, 'La fase del ciclo escolar es obligatorio'],
        }
    },
    creatorUser: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    subjects: [{
                subject: {
                    type: Schema.ObjectId,
                    ref: 'Subject',
                },
                phase: [{
                    phaseStatus: {
                        type: String,
                        enum: validPhaseStatus,
                        lowercase: true,
                        required: [true, 'El estatus de la fase es requerida'],
                        trim: true
                    },
                    semester: {
                        type: Number,
                        max: 13,
                        min: 1,
                        required: [ true, 'El semestre es obligatorio' ],
                    }
                }],
                atRisk: {
                    type: String,
                    lowercase: true,
                    trim: true,
                    default: '',
                },
                semester: {
                    type: Number,
                    max: 13,
                    min: 1,
                    required: [ true, 'El semestre es obligatorio' ],
                }
            }
        ] 
}, {
    timestamps: {
        createdAt: 'createdAt', 
        updatedAt: 'updatedAt' 
    }
});


module.exports = model('AcademicCareer', academicCareerSchema);