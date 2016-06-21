var restify   = require('restify');
var jwt       = require('jsonwebtoken');
var UserModel = require('../users/user.model');
var StoreModel = require('../stores/store.model');
var PaymentModel = require('../payments/payment.model');

/**
* Find address
**/

module.exports.index = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);

  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({ _id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({user: user._id}, function (err, store) {
      if (err) return next(err)
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      PaymentModel.findOne({ store: store._id }, function (err, payment) {
        if (err) return next(err)
        if (!payment)
          return next(new restify.errors.UnauthorizedError("Payment settings not found."));
        res.send({
          message: 'User was successfully created.',
          payment: {
            stripe_apikey: payment.stripe_apikey,
            stripe_secretkey: payment.stripe_secretkey,
            stripe_active: payment.stripe_active
          }
        });
        return next();
      });

    });

  });
}

/**
* Create payment method
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var paymentReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) return next(err)
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      var payment   = new PaymentModel(paymentReq);
      payment.store = store._id
      payment.save(function (err, payment) {
        if (err) next(err);
        res.send({
          message: 'Payment settings was successfully inserted.',
          payment: {
            stripe_apikey: payment.stripe_apikey,
            stripe_secretkey: payment.stripe_secretkey,
            stripe_active: payment.stripe_active
          }
        });
        return next();
      });

    });

  });
}
