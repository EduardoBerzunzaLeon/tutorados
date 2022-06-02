const { Schema, model } = require('mongoose');


const validCores = {
    values: ['básico', 'sustantivo', 'integral'],
    message: '{VALUE} no es un núcleo valido',
};

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [5, 'El {PATH} debe ser mínimo de 5 carácteres'],
    },
    semester: {
        type: Number,
        min: [1, 'Mínimo debe ser del primer semestre'],
        max: [9, 'Máximo el noveno semestre'],
        required: [true, 'El semestre es obligatorio'],
        validate: [Number.isInteger, '{VALUE} no es un número entero']
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
    requiredSubjects: [{
        type: Schema.ObjectId,
        ref: 'Subject'
    }],
    credit: {
        type: Number,
        required: [true, 'Los créditos son obligatorios'],
        validate: [Number.isInteger, '{VALUE} no es un número entero']
    },
    practicalHours: {
        type: Number,
        required: [true, 'El semestre es obligatorio'],
        validate: [Number.isInteger, '{VALUE} no es un número entero'],
        default: 0,
    },
    theoreticalHours: {
        type: Number,
        required: [true, 'El semestre es obligatorio'],
        validate: [Number.isInteger, '{VALUE} no es un número entero'],
        default: 0,
    },
    core: {
        type: String,
        enum: validCores,
        lowercase: true,
        required: [true, 'El núcleo es obligatorio'],
      }
});


SubjectSchema.pre('save', function(next) {
    if(!this.isModified('deprecated') || this.isNew || this.deprecated) return next();
    this.deprecatedAt = Date.now() - 1000;
    return next();
});



SubjectSchema.index( { "$**": "text" } );
module.exports = model('Subject', SubjectSchema);