var restify   = require('restify');
var jwt       = require('jsonwebtoken');
var UserModel = require('../users/user.model');
var AddressModel = require('./address.model');

/**
* Find address
**/

module.exports.index = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var params = req.params;

  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    AddressModel
    .where({user: user._id})
    .skip(params.offset || 0)
    .limit(params.limit || 10)
    .exec(function (err, addresses) {
      if (err) return next(err)
      res.send(addresses);
      return next();
    })
  });
}

/**
* Create address
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var addressReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id}, function (err, user) {
    if (err) return next(user)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    var address  = new AddressModel(addressReq)
    address.user = user._id;
    address.save(function (err, address) {
      if (err) return next(err)
      res.send({
        message: 'User was successfully created.',
        address: address
      });
      return next();
    })
  });
}

/**
* Remove address
**/

module.exports.delete = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var addressReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id}, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    AddressModel.findOne({ _id: addressReq.id, user: user._id }, function (err, address) {
      if (err) return next(err)
      if (address) {
        address.remove(function (err) {
          if (err) return next(err)
          res.send({message: 'Address deleted successfully'})
        });
      } else
        return next(new restify.errors.UnauthorizedError("Permission denied."));
    });
  });
}
