var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var bcrypt     = require('bcrypt');
var Schema     = mongoose.Schema;

/**
* User Database Schema
**/

var UserSchema = new Schema({
  name: { type: String,
          required: true,
          minlength: [ 3, 'Very short name' ],
          maxlength: [ 64, 'Very long name' ]
  },
  email: { type: String,
           trim: true,
           lowercase: true
  },
  type: { type: String },
  password: { type: String,
              minlength: [ 3, 'Very short password' ],
              maxlength: [ 64, 'Very long password' ]
  },
  facebook: { type: String },
  twitter: { type: String }
});

/**
* Password crypt middleware
**/

UserSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      return next();
    });
  });
});

/**
* Compare password method
**/

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

/**
* Timestamps plugin
**/

UserSchema.plugin(timestamps);

/**
* Create and exports model
**/

var UserModel  = mongoose.model('User', UserSchema);
module.exports = UserModel;
