const { Schema, model } = require('mongoose');

const validStatus = {
    values: ['regular', 'baja', 'baja temporal', 'egresado'],
    message: '{VALUE} no es un estatus válido'
};


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
        modifiedAt: {
            type: Date,
        },
        comments: {
            type: String,
            trim: true,
            lowercase: true,
        },
    }],
    enrollment: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [ true, 'La matricula es obligatoria' ]
    },
    currentSemeter: {
        type: Number,
        required: [ true, 'El semestre actual es obligatorio' ],
        min: 1,
        max: 13,
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
    }]
});


module.exports = model('Student', StudentSchema);