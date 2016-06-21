var restify       = require('restify');
var mongoose      = require('mongoose');
var timestamps    = require('mongoose-timestamp');
var ProductModel  = require('../products/product.model');
var AddressSchema = require('../addresses/address.schema');
var Schema        = mongoose.Schema;

/**
* Order database Schema
**/

var OrderSchema = new Schema({
  products: [{
    _id: { type: String },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number }
  }],
  address: AddressSchema,
  tax: { type: Number },
  shipping: { type: Number },
  discount: { type: Number },
  subtotal: { type: Number },
  total: { type: Number },
  status: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

/**
* Timestamps plugin
**/

OrderSchema.plugin(timestamps);

/**
* update product stock middleware
**/

OrderSchema.pre('save', function (next) {
  var order    = this;
  var products = order.products;
  var idItems = products.map(function (product) {
    return product._id
  });
  ProductModel.find({ _id: { $in: idItems } }, function (err, storeProducts) {
    if (err) return next(err)
    storeProducts.forEach(function (storeProduct, i) {
      ProductModel.update({ _id: storeProduct._id }, { $inc : { quantity: -Math.abs(products[i].quantity) } }, function (err) {
        if (err) return next(err)
        return next();
      });
    });
  });
});

/**
* Create and exports model
**/

var OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel;
