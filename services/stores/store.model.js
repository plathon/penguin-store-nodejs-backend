var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* Store Database Schema
**/

var StoreSchema = new Schema({
  name: { type: String,
          trim: true,
          required: true,
          minlength: [ 3, 'Very short name' ],
          maxlength: [ 64, 'Very long name' ]
  },
  url: { type: String,
         trim: true,
         lowercase: true,
         minlength: [ 4, 'Very short name' ],
         maxlength: [ 64, 'Very long name' ]
  },
  description: { type: String },
  available: { type: Boolean },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

/**
* Timestamps plugin
**/

StoreSchema.plugin(timestamps);

/**
* Create and exports model
**/

var StoreModel  = mongoose.model('Store', StoreSchema);
module.exports = StoreModel;
