const { Schema, model } = require('mongoose');

const validPhaseStatus = {
    values: ['generado', 'sin generar'],
    message: '{VALUE} no es un estatus de fase válida'
};

const schoolYearSchema = new Schema({
    schoolYear: {
        start: {
            type: Number,
            required: [ true, 'El inicio del ciclo escolar es obligatorio' ]
        },
        end: {
            type: Number,
            required: [ true, 'El fin del ciclo escolar es obligatorio' ]
        }
    },
    firstPhase: {
        user: {
            type: Schema.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        modifiedAt: {
            type: Date,
            select: false
        },
        status: {
            type: String,
            enum: validPhaseStatus,
            lowercase: true,
            required: [true, 'El estatus de la fase es requerida'],
            trim: true
        },
    },
    secondPhase: {
        user: {
            type: Schema.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        modifiedAt: {
            type: Date,
            select: false
        },
        status: {
            type: String,
            enum: validPhaseStatus,
            lowercase: true,
            required: [true, 'El estatus de la fase es requerida'],
            trim: true
        },
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    beforeSchoolYear: {
        type: Schema.ObjectId,
        ref: 'SchoolYear'
    }
}, { timestamps: true });

module.exports = model('SchoolYear', schoolYearSchema);