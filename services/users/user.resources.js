var restify   = require('restify');
var jwt       = require('jsonwebtoken');
var UserModel = require('./user.model');
var request   = require('request');
var qs        = require('querystring');

/**
* register user and return JWT
**/

module.exports.create = function (req, res, next) {
  var user = req.params;
  UserModel.findOne({ email: user.email }, function (err, userExists) {
    if (err) return next(err)
    if (userExists)
      return next(new restify.errors.UnauthorizedError('User already exists.'));

      UserModel.create( user, function (err, user) {
        if (err) return next(err)
        var userData = { _id: user._id, name: user.name, email: user.email, type: user.type };
        jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
          if (err) return next(err)
          res.send({
            message: 'User was successfully created.',
            token: token
          });
          return next();
        });
      });

  });
}


/**
* Update user data
**/

module.exports.update = function (req, res, next) {
  //parse JWT and get current user data
  var userCredential = jwt.verify( req.headers.authorization, process.env.APP_SECRET )
  var user = req.params;
  //update user information
  UserModel.update({ _id: userCredential._id }, user, function (err, user) {
    if (err) return next(err)
    var userData = { _id: user._id, name: user.name, email: user.email };
    jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
      if (err) return next(err)
      res.send({
        message: 'User successfully updated.',
        token: token
      });
      return next();
    });
  })
}

/**
* autenticate user and return JWT
**/

module.exports.auth = function (req, res, next) {
  var userReq = req.params;
  UserModel.findOne({ email: userReq.email }, function (err, user) {
    if (err) return next(err)
    if(!user)
      next(new restify.errors.UnauthorizedError("User not found."));

    if(!user.comparePassword(userReq.password)) {
      next(new restify.errors.UnauthorizedError("Username and password do not match"));
    } else {
      var userData = { _id: user._id, name: user.name, email: user.email, type: user.type };
      jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
        if (err) return next(err)
        res.send({
          message: 'Successfully logged in.',
          token: token
        });
        return next();
      });
    }
  });
}

/**
* Update user password
**/

module.exports.updatePassword = function (req, res, next) {
  //parse JWT and get current user data
  var userCredential = jwt.verify( req.headers.authorization, process.env.APP_SECRET )
  var userReq = req.params;
  UserModel.findOne({ _id: userCredential._id }, function (err, user) {
    if (err) return next(err)
    if (!user)
      return next(new restify.errors.UnauthorizedError("Impossible to retrieve user"));

    if (user.comparePassword(userReq.current_password)) {
      if (userReq.password === userReq.confirm_password) {

        user.password = userReq.password;
        user.save(function (err) {
          if (err) return next(err)
          res.send({
            message: 'User password successfully updated.'
          });
          return next();
        })
      } else
      return next(new restify.errors.UnauthorizedError("password and password confirmation not match."));
    } else
      return next(new restify.errors.UnauthorizedError("Invalid current password."));
  });
}

/**
* auth user with facebook api and return JWT
**/

module.exports.facebookAuth = function (req, res, next) {
  var reqBody        = req.params;
  var fields         = [ 'id', 'email', 'first_name', 'last_name', 'link', 'name' ];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl    = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');

  var params = {
    code: reqBody.code,
    client_id: reqBody.client_id,
    client_secret: process.env.FACEBOOK_SECRET,
    redirect_uri: reqBody.redirect_uri
  }

  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {

    if (response.statusCode !== 200)
      return next(new restify.errors.UnauthorizedError("Impossible to retrieve token"));

    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
     if (response.statusCode !== 200)
      return next(new restify.errors.UnauthorizedError("Impossible to retrieve profile"));

        UserModel.findOne({ facebook: profile.id }, function (err, user) {
          if (err) return next(err);

          if (!user) {

            UserModel.create({ name: profile.name, facebook: profile.id  }, function (err, user) {
              if (err) return next(err)
              var userData = { _id: user._id, name: user.name };
              jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
                if (err) return next(err)
                res.send({
                  message: 'User was successfully created.',
                  token: token
                });
                return next();
              });

            });

          } else {

            var userData = { _id: user._id, name: user.name };
            jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
              if (err) return next(err)
              res.send({
                message: 'Successfully logged in.',
                token: token
              });
              return next();
            });

          }

        });

     });

  });
}

/**
* auth user with twitter oauth api and return JWT
**/

module.exports.twitterAuth = function (req, res, next) {

    var reqBody         = req.params;
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl  = 'https://api.twitter.com/oauth/access_token';
    var profileUrl      = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

    if (reqBody.redirect_uri) {

      var requestTokenOauth = {
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        callback: reqBody.redirect_uri
      }

      request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
        var oauthToken = qs.parse(body);
        res.send(oauthToken);
      });

    } else if (reqBody.oauth_token && reqBody.oauth_verifier) {

      var accessTokenOauth = {
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        token: reqBody.oauth_token,
        verifier: reqBody.oauth_verifier
      }

    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {
      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      request.get({
        url: profileUrl + accessToken.screen_name,
        oauth: profileOauth,
        json: true
      }, function(err, response, profile) {

        UserModel.findOne({ twitter: profile.id }, function (err, user) {
          if (err) return next(err);

          if (!user) {

            UserModel.create({ name: profile.name, twitter: profile.id  }, function (err, user) {
              if (err) return next(err)
              var userData = { _id: user._id, name: user.name };
              jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
                if (err) return next(err)
                res.send({
                  message: 'User was successfully created.',
                  token: token
                });
                return next();
              });

            });

          } else {

            var userData = { _id: user._id, name: user.name };
            jwt.sign(userData, process.env.APP_SECRET, { expiresIn: 172800000 }, function (err, token) {
              if (err) return next(err)
              res.send({
                message: 'Successfully logged in.',
                token: token
              });
              return next();
            });

          }

        });

      });
    });

    }

}
