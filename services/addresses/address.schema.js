var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* Address Database Schema
**/

var AddressSchema = new Schema({
  name: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 3, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  address_line_one: {
    required: true,
    type: String,
    trim: true
  },
  address_line_two: {
    type: String,
    trim: true
  },
  address_line_three: {
    type: String,
    trim: true
  },
  city: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 2, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  state: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 2, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  zip: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 2, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  country: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 2, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  phone: {
    required: true,
    type: String,
    trim: true,
    minlength: [ 2, 'Very short name' ],
    maxlength: [ 64, 'Very long name' ]
  },
  user: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

/**
* Timestamps plugin
**/

AddressSchema.plugin(timestamps);

/**
* Export Schema
**/

module.exports = AddressSchema;
