var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* product Database Schema
**/

var ProductSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  available: { type: Boolean },
  category: {
    type: String,
    minlength: [ 3, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  store: { type: Schema.Types.ObjectId, ref: 'Store' }
});

ProductSchema.index({ name: 'text' });

/**
* Timestamps plugin
**/

ProductSchema.plugin(timestamps);

/**
* Create and exports model
**/

var ProductModel  = mongoose.model('Product', ProductSchema);
module.exports = ProductModel;
