var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* Shipping Database Schema
**/

var ShippingSchema = new Schema({
  title: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 3, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  delivery_min_time: {
    required: true,
    type: Number,
    trim: true
  },
  delivery_max_time: {
    required: true,
    type: Number,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    required: true,
    type: Number
  },
  country: {
    required: true,
    type: String,
    trim: true
  },
  store: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Store'
  }
});

/**
* Timestamps plugin
**/

ShippingSchema.plugin(timestamps);

/**
* Create and exports model
**/

var ShippingModel  = mongoose.model('Shipping', ShippingSchema);
module.exports = ShippingModel;
