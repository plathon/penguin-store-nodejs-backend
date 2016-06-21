var restify   = require('restify');
var jwt       = require('jsonwebtoken');
var UserModel = require('../users/user.model');
var StoreModel = require('../stores/store.model');
var ProductModel = require('./product.model');

/**
* List products
**/

module.exports.index = function (req, res, next) {
  var params = req.params;

  //validate search
  if (params['searchTerm'] != undefined)
    var criteria = ( params.searchTerm ) ? { $text: { $search: params.searchTerm } } : {}
  //validate category query
  if (params['category'] != undefined)
    var criteria = { category: params.category }

  //validate pagination
  var limit  = ( params.limit )  ? params.limit  : 9
  var offset = ( params.offset ) ? params.offset : 0

  ProductModel.find( criteria )
  .limit( limit )
  .skip( offset )
  .sort({ createdAt: -1 })
  .exec(function (err, products) {
    if (err) return next(err);
    res.send({ products: products });
    next();
  });
}

/**
* insert product
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var productReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) return next(err)
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

        var product = new ProductModel(productReq)
        product.store = store._id;
        product.save(function (err, product) {
          if (err) return next(err);
          res.send({
            message: "Product was successfully created.",
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              description: product.description,
              quantity: product.quantity,
              category: product.category,
              available: product.available
            }
          });
          next();
        });
    });
  });
}

/**
* update product
**/

module.exports.update = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var productReq = req.params;

  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({ _id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) return next(err)
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      ProductModel.update({ _id: productReq._id, store: store._id }, productReq, function (err) {
        if (err) return next(err);
        res.send({ message: "product was successfuly updated" });
        next();
      });

    });
  });
}

/**
* remove product
**/

module.exports.delete = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var productReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({ _id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) return next(err)
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      ProductModel.findOne({ _id: productReq.id, store: store._id }, function (err, product) {
        if (err) return next(err)
        if (!product)
          return next(new restify.errors.UnauthorizedError("Product not found."));

        product.remove(function (err) {
          if (err) return next(err);
          res.send({ message: "Product was successfully removed." });
          next();
        });

      });
    });
  });
}
