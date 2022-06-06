const { Schema, model } = require('mongoose');

const validPhaseStatus = {
    values: ['aprobado', 'reprobado', 'cursando'],
    message: '{VALUE} no es un estatus de fase válida'
};


const SubjectHistorySchema = new Schema({
    student: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    subject: {
        type: Schema.ObjectId,
        ref: 'Subject',
    },
    phase: [
        {
            phaseStatus: {
                type: String,
                enum: validPhaseStatus,
                lowercase: true,
                required: [true, 'El estatus de la fase es requerida'],
                trim: true
            },
            date: {
                type: Date,
                default: Date.now(),
            },
            semester: {
                type: Number,
                max: 13,
                min: 1,
                required: [ true, 'El semestre es obligatorio' ],
            }
        }
    ]
});




module.exports = model('SubjectHistory', SubjectHistorySchema);