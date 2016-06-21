var restify       = require('restify');
var jwt           = require('jsonwebtoken');
var UserModel     = require('../users/user.model');
var StoreModel    = require('../stores/store.model');
var ShippingModel = require('./shipping.model');

/**
* List Shipping options
**/

module.exports.index = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var shippingReq = req.params;
  if (!user)
    return next( new restify.errors.UnauthorizedError("User not found.") );

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({user: user._id}, function (err, store) {
      if (err) return next(err);
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      ShippingModel.find({ store: store._id }, function (err, shipping) {
        if (err) return next(err);
        res.send({ shipping: shipping });
        next();
      });

    });

  });
}

/**
* Create Shipping option
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var shippingReq = req.params;
  if (!user)
    return next( new restify.errors.UnauthorizedError("User not found.") );

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({user: user._id}, function (err, store) {
      if (err) return next(err);
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      var shipping   = new ShippingModel(shippingReq);
      shipping.store = store._id;
      shipping.save(function (err, shipping) {
        if (err) return next(err);
        res.send({
          message: "Shipping option was successfully created.",
          shipping: shipping.toJSON()
        });
        next();
      });
    });

  });
}

/**
* Update Shipping option
**/

module.exports.update = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var shippingReq = req.params;
  if (!user)
    return next( new restify.errors.UnauthorizedError("User not found.") );

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({user: user._id}, function (err, store) {
      if (err) return next(err);
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      ShippingModel.update({ _id: shippingReq._id, store: store._id }, shippingReq, function (err) {
        if (err) return next(err);
        res.send({ message: "Shipping option was successfully updated." });
        next();
      });

    });
  });
}

/**
* Delete Shipping option
**/

module.exports.delete = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var shippingReq = req.params;
  if (!user)
    return next( new restify.errors.UnauthorizedError("User not found.") );

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({user: user._id}, function (err, store) {
      if (err) return next(err);
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      ShippingModel.findOne({ _id: shippingReq.id, store: store._id }, function (err, shipping) {
        if (err) return next(err);
        if (!shipping)
          return next(new restify.errors.UnauthorizedError("Shipping option not found."));

        shipping.remove(function (err) {
          if (err) return next(err)
          res.send({ message: "Shipping option was successfully removed." });
          next();
        });
      });
    });
  });
}
