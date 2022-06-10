const { Schema, model } = require('mongoose');

const courseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        lowercase: true,
        minlength: [4, 'El {PATH} debe ser mínimo de 8 carácteres'],
    },
    impartedAt: {
        type: Date,
        default: Date.now(),
        required: [true, 'la fecha es obligatoria'],
    },
    professor: {
        type: Schema.ObjectId,
        ref: 'Professor',
        required: [true, 'El profesor es obligatorio'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

courseSchema.index({
    name: 1, 
    impartedAt: 1, 
    professor: 1
}, {unique: true});


// courseSchema.pre(/^find/, function(next) {
   
//    if(this._conditions?.professor) return next();

//     this.populate({
//         path: 'professor',
//         select: 'name.first name.last'
//     });

//     return next();
// });

module.exports = model('Course', courseSchema);