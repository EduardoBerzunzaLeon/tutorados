const { Schema, model } = require('mongoose');

const validPhaseStatus = {
    values: ['aprobado', 'reprobado', 'cursando'],
    message: '{VALUE} no es un estatus de fase válida'
};


const subjectHistorySchema = new Schema({
    student: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    subject: {
        type: Schema.ObjectId,
        ref: 'Subject',
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
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
    ],
});


// subjectHistorySchema.statics.calcCurrentSemester = async function( studentId, subjectId ) {

//     const currentSemester = await this.aggregate([
//         // Implements Aggregation pipeline
//     ]);
    
//     console.log(currentSemester);
//     if (currentSemester.length > 0 ) {
//         console.log('greater than 0' );
//     }
// }

// Create 
// subjectHistorySchema.post('save', function() {
   
//     // this points to current subjectHistory

//     this.constructor.calcCurrentSemester(this.student, this.subject);

// });

// Update and delete
// subjectHistorySchema.pre(/^findOneAdd/, async function(next) {
//     this.subjectInHistory = await this.findOne();
//     next();
// });

// subjectHistorySchema.post(/^findOneAdd/, async function() {
//     // this.subjectInHistory = await this.findOne(); does NOT work here, query has already been executed
//     await this.subjectInHistory.constructor.calcCurrentSemester( this.subjectInHistory.student, this.subjectInHistory.subject );

// });




module.exports = model('SubjectHistory', subjectHistorySchema);