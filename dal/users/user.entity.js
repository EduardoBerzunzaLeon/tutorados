const { Schema, model } = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
// const mongoosePaginate = require('mongoose-paginate-v2');

const bcrypt = require('bcrypt');

const validGenders = {
  values: ['masculino', 'femenino'],
  message: '{VALUE} no es un género válido',
};

const UserSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
      },
      last: {
        type: String,
        required: [true, 'Los apellidos es obligatorio'],
        trim: true,
      },
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, 'El email es obligatorio'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Por favor confirmar su contraseña'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: '¡Las contraseñas no coinciden!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    gender: {
      type: String,
      enum: validGenders,
      required: [true, 'El género es obligatorio'],
    },
    avatar: String,
    google: {
      type: Boolean,
      default: false,
    },
  },
  {
    toObject: { virtuals: true },
  }
);

UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// UserSchema.virtual('fullName').get(function () {
//   return `${this.name.first} ${this.name.last}`;
// });

// UserSchema.plugin(uniqueValidator, { message: '{PATH} ya existe' });
// UserSchema.plugin(mongoosePaginate);

module.exports = model('User', UserSchema);
