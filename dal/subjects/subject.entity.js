const { Schema, model } = require('mongoose');

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [8, 'El {PATH} debe ser mínimo de 8 carácteres'],
    },
    semester: {
        type: Number,
        required: [true, 'El semestre es obligatorio'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    deprecated: {
        type: Boolean,
        default: false,
    },
    deprecatedAt: Date,
    consecutiveSubject: {
        type: Schema.ObjectId,
        ref: 'Subject'
    },
    credit: {
        type: Number,
        required: [true, 'Los créditos son obligatorios']
    }
});


SubjectSchema.pre('save', function(next) {
    if(!this.isModified('deprecated') || this.isNew) return next();
    this.deprecatedAt = Date.now() - 1000;
    return next();
});




SubjectSchema.index( { "$**": "text" } );
module.exports = model('Subject', SubjectSchema);