var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
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
              select: false,
              minlength: [ 3, 'Very short password' ],
              maxlength: [ 64, 'Very long password' ]
  },
  facebook: { type: String },
  twitter: { type: String }
});

/**
* Timestamps plugin
**/

UserSchema.plugin(timestamps);

/**
* Create and exports model
**/

var UserModel  = mongoose.model('User', UserSchema);
module.exports = UserModel;
