var restify      = require('restify');
var jwt          = require('jsonwebtoken');
var UserModel    = require('../users/user.model');
var StoreModel   = require('../stores/store.model');
var ProductModel = require('../products/product.model');
var OrderModel   = require('./order.model');

/**
* List orders
**/

module.exports.index = function (req, res, next) {
  var user = jwt.verify( req.headers.authorization, process.env.APP_SECRET );
  UserModel.find({ _id: user._id }, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));
    OrderModel.find()
    .exec(function (err, orders) {
      if (err) return next(err)
      res.send({ orders: orders });
      next();
    });
  });
}

/**
* Create order
**/

module.exports.create = function (req, res, next) {
  var user     = jwt.verify( req.headers.authorization, process.env.APP_SECRET );
  var params   = req.params;
  var products = params.products;
  var order    = new OrderModel(params);

  if (!user) return next(new restify.errors.UnauthorizedError('User not found.'));

  UserModel.findOne({ _id: user._id }, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError('User not found.'));
    order.user = user._id
    var cartProducts = products.map(function (cartProduct) {
      return cartProduct._id
    });
    ProductModel.find({ _id: { $in: cartProducts } }, function (err, storeProducts) {
      if (err) return next(err)
      order.subtotal = 0;
      order.total    = 0;
      storeProducts.forEach(function (storeProduct, i) {
        if (storeProduct.quantity <= 0 || products[i].quantity > storeProduct.quantity)
          return next(new restify.errors.UnauthorizedError('Impossible to supply the requested amount.'));
          order.subtotal += storeProduct.price * products[i].quantity;
          order.total    += storeProduct.price * products[i].quantity;
      });
      order.tax      = 0;
      order.shipping = 0;
      order.discount = 0;
      order.status   = 'Waiting for payment';
      order.save(function (err) {
        if (err) return next(err)
        res.send({ message: 'Purchase completed successfully.' })
        return next();
      });
    });
  });
}
