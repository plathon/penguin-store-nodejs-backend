var restify    = require('restify');
var jwt        = require('jsonwebtoken');
var StoreModel = require('./store.model');
var UserModel = require('../users/user.model');

/**
* find Store
**/

module.exports.find = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({ _id: user._id }, function (err, user) {
    if (err) return next(err);
    if (!user)
      return next(new restify.errors.UnauthorizedError("User not found."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) next(err);
      if (!store)
        return next(new restify.errors.UnauthorizedError("Store not found."));

      var userStore = {
        _id: store._id,
        name: store.name,
        description: store.description,
        url: store.url,
        available: store.available,
      };

      res.send({ store: userStore });
      return next();

    });
  });
}

/**
* create Store
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var storeReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("Permission denied."));

    StoreModel.findOne({ user: user._id }, function (err, store) {
      if (err) return next(err)
      if (store)
        return next(new restify.errors.UnauthorizedError("you've already created a store."));

      var newStore = new StoreModel(storeReq);
      newStore.user = user._id
      newStore.save(function (err, store) {
        if (err) return next(err)
        res.send({
          message: 'Store was successfully created.',
          store: {
            _id: store._id,
            name: store.name,
            description: store.description,
            url: store.url,
            available: store.available,
          }
        });
        return next();
      })

    });
  });
}

/**
* Update store
**/

module.exports.update = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var storeReq = req.params;
  if (!user)
    return next(new restify.errors.UnauthorizedError("User not found."));

  UserModel.findOne({_id: user._id, type: "admin"}, function (err, user) {
    if (err) next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("Permission denied."));

    StoreModel.update({ user: user._id }, storeReq, function (err) {
      if (err) return next(err)
      res.send({ message: 'Store was successfully updated.' });
      return next();
    })
  });
}
