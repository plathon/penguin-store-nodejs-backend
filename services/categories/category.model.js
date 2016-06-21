var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* catgory Database Schema
**/

var CategorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    minlength: [ 3, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  store: { type: Schema.Types.ObjectId, ref: 'Store' }
});

/**
* Timestamps plugin
**/

CategorySchema.plugin(timestamps);

/**
* Create and exports model
**/

var CategoryModel  = mongoose.model('Category', CategorySchema);
module.exports = CategoryModel;
