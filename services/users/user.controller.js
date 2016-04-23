var bcrypt    = require('co-bcrypt');
var jwt       = require('jsonwebtoken');
var config    = require('../../config');
var UserModel = require('./user.model');
var request   = require('request-promise');
var qs        = require('querystring');

/**
* autenticate user and return JWT
**/

module.exports.auth = function *(){
  try {
    var reqBody = this.request.body;
      //get user by credentials
      var user = yield UserModel.findOne({ email: reqBody.email }).select( '+password' );

      if (!user)
        this.throw('User not found.', 400);

      //decrypt the password and validate
      if ( yield bcrypt.compare( reqBody.password, user.password ) ) {

        //generate JWT
        var token = jwt.sign( user, config.secret, { expiresInMinutes: 60*5 } );
        //response
        this.body = {
          msg: 'Successfully logged in.',
          token: token
        }

      } else
        this.throw('Username and password do not match.', 400);

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}

/**
* register user and return JWT
**/

module.exports.create = function *() {
  try {
    var reqBody    = this.request.body;
    var userExists = yield UserModel.findOne({ email: reqBody.email });

    if ( userExists )
      this.throw('User already exists.', 400);

      //hash the password
      var salt = yield bcrypt.genSalt(10);
      var hash = yield bcrypt.hash(reqBody.password, salt);
      reqBody.password = hash;

      //persists user
      var user = yield UserModel.create(reqBody);
      //generate JWT
      var token = jwt.sign(user.withoutPassword, config.secret, { expiresInMinutes: 60*5 });

      //response
      this.body = {
        msg: 'User was successfully created.',
        token: token
      }

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}

/**
* auth user with facebook api and return JWT
**/

module.exports.facebook = function *() {
  try {

    var reqBody        = this.request.body;
    var fields         = [ 'id', 'email', 'first_name', 'last_name', 'link', 'name' ];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl    = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');

    var params = {
      code: reqBody.code,
      client_id: reqBody.client_id,
      client_secret: config.facebook_secret,
      redirect_uri: reqBody.redirect_uri
    }

    var accessToken = yield request.get({ url: accessTokenUrl, qs: params, json: true })
    var profile     = yield request.get({ url: graphApiUrl, qs: accessToken, json: true })
    var userProfile = yield UserModel.findOne({ facebook: profile.id })

    if ( !userProfile ) {

      var user = yield UserModel.create({
        name: profile.name,
        facebook: profile.id
      })

      var token = jwt.sign( user, config.secret, { expiresInMinutes: 60*5 } );

      this.body = {
        msg: 'User was successfully created.',
        token: token
      }

    } else {

      var token = jwt.sign( userProfile, config.secret, { expiresInMinutes: 60*5 } );

      this.body = {
        msg: 'Successfully logged in.',
        token: token
      }

    }

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}

/**
* auth user with twitter oauth api and return JWT
**/

module.exports.twitter = function *() {
  try {

    var reqBody         = this.request.body;
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl  = 'https://api.twitter.com/oauth/access_token';
    var profileUrl      = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

    if (reqBody.redirect_uri) {

      var requestTokenOauth = {
        consumer_key: config.twitter_key,
        consumer_secret: config.twitter_secret,
        callback: reqBody.redirect_uri
      }

      var oauthToken = yield request.post({ url: requestTokenUrl, oauth: requestTokenOauth })
      oauthToken = qs.parse( oauthToken );
      this.body = oauthToken

    } else if (reqBody.oauth_token && reqBody.oauth_verifier) {

      var accessTokenOauth = {
        consumer_key: config.twitter_key,
        consumer_secret: config.twitter_secret,
        token: reqBody.oauth_token,
        verifier: reqBody.oauth_verifier
      }

      var accessToken = yield request.post({ url: accessTokenUrl, oauth: accessTokenOauth })
      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: config.twitter_key,
        consumer_secret: config.twitter_secret,
        oauth_token: accessToken.oauth_token
      }

      var profileOauthData = yield request.get({
        url: profileUrl + accessToken.screen_name,
        oauth: profileOauth,
        json: true
      })

      var profile = yield UserModel.findOne({ twitter: profileOauthData.id })

      if (!profile) {

        var user = yield UserModel.create({
          name: profileOauthData.name,
          twitter: profileOauthData.id
        })

        var token = jwt.sign( user, config.secret, { expiresInMinutes: 60*5 } );

        this.body = {
          msg: 'User was successfully created.',
          token: token
        }

      } else {

        var token = jwt.sign( profile, config.secret, { expiresInMinutes: 60*5 } );

        this.body = {
          msg: 'Successfully logged in.',
          token: token
        }

      }

    } else
      this.throw( 'Wrong request' );

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}
