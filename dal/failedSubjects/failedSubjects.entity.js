const { Schema, model } = require('mongoose');

const validErrors = {
    values: ['Materia no encontrada', 'Alumno no encontrado'],
    message: '{VALUE} no es un error válido'
};

const failedSubjectsSchema = new Schema({
    enrollment: {
        type: String,
        lowercase: true,
        trim: true,
        required: [ true, 'La matricula es obligatoria' ]
    },
    subject: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        lowercase: true,
        minlength: [5, 'La materia debe ser mínimo de 5 carácteres'],
    },
    schoolYear: {
        period: {
            start: {
                type: Number,
                required: [ true, 'El inicio del ciclo escolar es obligatorio' ]
            },
            end: {
                type: Number,
                required: [ true, 'El fin del ciclo escolar es obligatorio' ]
            }
        },
        phase: {
            type: Number,
            min: 1,
            max: 2,
            default: 1,
            required: [ true, 'La fase del ciclo escolar es obligatorio' ],
        }
    },
    error: {
        type: String,
        enum: validErrors,
        lowercase: true,
        trim: true,
    }
}, { timestamps: true });

module.exports = model('failedSubject', failedSubjectsSchema);