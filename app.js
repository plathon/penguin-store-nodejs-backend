var restify  = require('restify');
var mongoose = require('mongoose');
var env      = process.env.NODE_ENV || 'development';

if (env === 'development') {
  require('dotenv').config();
}

var config   = require('./config/index');
mongoose.connect(config.mongo);

//services
var users        = require('./services/users/user.resources');
var addresses    = require('./services/addresses/address.resources');
var stores       = require('./services/stores/store.resources');
var payments     = require('./services/payments/payment.resources');
var categories   = require('./services/categories/category.resources');
var products     = require('./services/products/product.resources');
var shipping     = require('./services/shipping/shipping.resources');
var orders       = require('./services/orders/order.resources');

//app config
var server = restify.createServer({
  name: 'app',
  version: '1.0.0'
});

//middlewares
restify.CORS.ALLOW_HEADERS.push('authorization');
server.pre(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

//routes
server.post('/users/auth', users.auth);
server.post('/users/oauth/facebook', users.facebookAuth);
server.post('/users/oauth/twitter', users.twitterAuth);
server.post('/users', users.create);
server.put('/users', users.update);
server.put('/users/password', users.updatePassword);
server.get('addresses', addresses.index);
server.post('addresses', addresses.create);
server.del('addresses/:id', addresses.delete);
server.get('store', stores.find);
server.post('store', stores.create);
server.put('store', stores.update);
server.get('payments', payments.index);
server.post('payments', payments.create);
server.get('categories', categories.index);
server.post('categories', categories.create);
server.del('categories/:id', categories.delete);
server.get('products', products.index);
server.post('products', products.create);
server.put('products', products.update);
server.del('products/:id', products.delete);
server.get('shipping', shipping.index);
server.post('shipping', shipping.create);
server.put('shipping', shipping.update);
server.del('shipping/:id', shipping.delete);
server.get('order', orders.index);
server.post('order', orders.create);

//start server
server.listen(3000);
