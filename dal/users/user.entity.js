

const crypto = require('crypto');
const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const generateHashedToken = require('../../api/utils/generateHashedToken');
const ROLES_LIST = require('../../config/authorization/roles');

const allowedRoles = Object.values(ROLES_LIST);


const validGenders = {
  values: ['M', 'F'],
  message: '{VALUE} no es un género válido',
};

const validRoles = {
  values: allowedRoles,
  message: '{VALUE} no es un role válido',
};

const UserSchema = new Schema({
  name: {
    first: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      lowercase: true,
    },
    last: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      lowercase: true,
    },
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'El email es obligatorio'],
    validate: [validator.isEmail, 'Porfavor ingresa un correo valido'],
  },
  avatar: {
    type: String,
    default: 'default.jpg',
  },
  roles: [{
    type: String,
    enum: validRoles,
    lowercase: true,
    required: [true, 'El rol es obligatorio'],
  }],
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'El {PATH} debe ser mínimo de 8 carácteres'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Por favor confirmar su contraseña'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Las contraseñas no coinciden',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
},
  active: {
    type: Boolean,
    default: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: validGenders,
    required: [true, 'El género es obligatorio'],
  },
  google: {
    type: Boolean,
    default: false,
  },
  facebook: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);


  // Delete confirmPassword field
  this.confirmPassword = undefined;
  next();
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  return next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = generateHashedToken(resetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// UserSchema.plugin(uniqueValidator, { message: '{PATH} ya existe' });
// UserSchema.plugin(mongoosePaginate);
UserSchema.index( { "$**": "text" } );

module.exports = model('User', UserSchema);
