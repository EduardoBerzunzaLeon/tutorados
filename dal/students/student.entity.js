const { Schema, model } = require('mongoose');

const validStatus = {
    values: ['regular', 'baja', 'baja temporal', 'egresado', 'rezago'],
    message: '{VALUE} no es un estatus válido'
};

const validChanellings = {
    values: ['no', 'asesoria', 'mentoria', 'atencion psicologica interna', 'atencion psicologica externa', 'consejeria'],
    message: '{VALUE} no es un estatus válido'
};

const validAtRisk = {
    values: ['no', 'ultimo intento', 'unica materia', 'no termina'],
    message: '{VALUE} no es un estatus válido'
};

const validClassrooms = {
    values: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    message: '{VALUE} no es un salón válido'
}


const StudentSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    professorsHistory: [{
        professor: {
            type: Schema.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        dischargeAt: {
            type: Date,
        },
        comments: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
        },
        idProfessorBefore: {
            type: Schema.ObjectId,
            ref: 'Student.professorsHistory',
        }
    }],
    enrollment: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [ true, 'La matricula es obligatoria' ]
    },
    currentSemester: {
        type: Number,
        required: [ true, 'El semestre actual es obligatorio' ],
        min: 1,
        max: 13,
        default: 1,
    },
    statusHistory: [{
        status: {
            type: String,
            enum: validStatus,
            lowercase: true,
            required: [ true, 'El estatus es obligatorio' ]
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        }
    }],
    classroom: {
        type: String,
        default: 'A',
        enum: validClassrooms,
        maxLength: 1,
        minLength: 1,
        required: [true, 'El grupo es obligatorio'],
        trim: true,
        uppercase: true,
    },
    atRisk: {
        type: String,
        enum: validAtRisk,
        lowercase: true,
        trim: true,
        default: 'no'
    },
    inChannelling: {
        type: String,
        enum: validChanellings,
        lowercase: true,
        trim: true,
        default: 'no'
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
});


module.exports = model('Student', StudentSchema);