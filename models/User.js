var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/workLog');
var schema = new mongoose.Schema({
    name : {type : String},
    email : {type : String},
    salt : {type : String, default : ''},
    passwd : {type : String}
});

module.exports = mongoose.model('User', schema, 'users');