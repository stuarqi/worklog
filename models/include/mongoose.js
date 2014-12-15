var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/workLog');

module.exports = mongoose;