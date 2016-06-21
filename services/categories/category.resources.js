var restify   = require('restify');
var jwt       = require('jsonwebtoken');
var UserModel = require('../users/user.model');
var StoreModel = require('../stores/store.model');
var CategoryModel = require('./category.model');

/**
* index Category
**/

module.exports.index = function (req, res, next) {
  CategoryModel.find({}, function (err, categories) {
    if (err) return next(err);
      res.send({ categories: categories });
      next();
  });
}

/**
* create Category
**/

module.exports.create = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var categoryReq = req.params;
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

      var category = new CategoryModel(categoryReq)
      category.store = store._id;
      category.save(function (err, category) {
        if (err) return next(err)
        res.send({ category: {
          _id: category._id,
          name: category.name
        }});
        next();
      });
    });
  });
}

/**
* Remove Category
**/

module.exports.delete = function (req, res, next) {
  var user = jwt.verify(req.headers.authorization, process.env.APP_SECRET);
  var categoryReq = req.params;
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

      CategoryModel.findOne({ _id: categoryReq.id }, function (err, category) {
        if (err) return next(err);
        if (!category)
          return next(new restify.errors.UnauthorizedError("Category not found."));

        category.remove(function (err) {
          if (err) return next(err)
          res.send({ message: "Category was successfully removed."});
          next();
        });
      });
    });
  });
}
