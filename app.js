var koa        = require('koa');
var env        = process.env.NODE_ENV
var route      = require('koa-route');
var bodyParser = require('koa-bodyparser');
var cors       = require('koa-cors');
var logger     = require('koa-logger');
var mongoose   = require('mongoose');
var jwt        = require('koa-jwt');

if (env === 'development') {
  require('dotenv').config();
}

var config     = require('./config');
mongoose.connect(config.mongo);

var app = koa();
var env = process.env.NODE_ENV || 'development';
if (env != 'test') app.use(logger())
app.use(bodyParser());
app.use(cors());

var users  = require('./services/users/user.controller');
var stores = require('./services/stores/store.controller');

//jwt auth config middleware
app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.body = 'Access denied';
    } else
      throw err;
  }
});

//public routes
//users
app.use(route.post('/signin', users.auth));
app.use(route.post('/signup', users.create));
app.use(route.post('/auth/facebook', users.facebook));
app.use(route.post('/auth/twitter', users.twitter));
//set auth middleware
app.use(jwt({ secret: config.secret }));
//private routes
app.use(route.get('/store/find', stores.find));
app.use(route.post('/store/create', stores.create));
app.use(route.post('/store/update', stores.update));

if (env === 'test')
  module.exports = app.listen(3001);
else
  app.listen(3001);
