var mongoose   = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema     = mongoose.Schema;

/**
* Payment Database Schema
**/

var PaymentSchema = new Schema({
  stripe_apikey: {
    type: String,
    trim: true,
    required: true,
  },
  stripe_secretkey: {
    type: String,
    trim: true,
    required: true,
  },
  stripe_active: { type: Boolean },
  store: { type: Schema.Types.ObjectId, ref: 'Store' }
});

/**
* Timestamps plugin
**/

PaymentSchema.plugin(timestamps);

/**
* Create and exports model
**/

var PaymentModel  = mongoose.model('Payment', PaymentSchema);
module.exports = PaymentModel;
