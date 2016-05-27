var jwt        = require('jsonwebtoken');
var StoreModel = require('./store.model');
var UserModel = require('../users/user.model');
var config    = require('../../config');

/**
* find Store
**/

module.exports.find = function *() {
  try{
    //parse JWT and get user data
    var user     = jwt.verify( this.request.header.authorization.substr(7), config.secret )
    //check user on database
    var userData = yield UserModel.findOne({ email: user.email, type: 'admin' }).select('_id')
    //throw error if user dont exists or dont ha permission
    if ( !userData )
     this.throw('unauthorized.', 400)
    //get store
    var store = yield StoreModel.findOne({ user: userData._id })
    //store exists
    if (!store) this.throw('Store impossible to retrieve.', 400)
    //send store data
    this.body = store.toJSON()

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}

/**
* create Store
**/

module.exports.create = function *() {
  try {

   var reqBody = this.request.body;
   //parse JWT and get user data
   var user     = jwt.verify( this.request.header.authorization.substr(7), config.secret )
   //check user on database
   var userData = yield UserModel.findOne({ email: user.email, type: 'admin' }).select('_id')

   //throw error if user dont exists or dont ha permission
   if ( !userData )
    this.throw('unauthorized.', 400)

   //create a new Store
   var store = yield StoreModel.create({
     name: reqBody.name,
     description: reqBody.description,
     url: reqBody.description,
     user: userData._id
   })

   this.body = {
     status: 'ok',
     message: 'Store settings successfully created'
   }

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}

/**
* Update Store
**/

module.exports.update = function *() {
  try{

    var reqBody = this.request.body;
    //parse JWT and get user data
    var user     = jwt.verify( this.request.header.authorization.substr(7), config.secret )
    //check user on database
    var userData = yield UserModel.findOne({ email: user.email, type: 'admin' }).select('_id')

    //throw error if user dont exists or dont ha permission
    if ( !userData )
     this.throw('unauthorized.', 400)

    //update new Store
    var store = yield StoreModel.update({ user: userData._id }, {
      name: reqBody.name,
      description: reqBody.description,
      url: reqBody.url,
      available: reqBody.available
    })

    this.body = {
      status: 'ok',
      message: 'Store settings successfully updated'
    }

  } catch (err) {
    this.status = err.status || 500;
    this.body   = { error: { message: err.message } }
    this.app.emit('error', err, this);
  }
}
