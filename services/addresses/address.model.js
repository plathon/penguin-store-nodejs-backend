var mongoose      = require('mongoose');
var AddressSchema = require('./address.schema');

/**
* Create and exports model
**/

var AddressModel  = mongoose.model('Address', AddressSchema);
module.exports = AddressModel;
