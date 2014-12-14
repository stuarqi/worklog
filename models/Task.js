var mongoose = require('../lib/mongoose');

var schema = new mongoose.Schema({
    name : {type : String},
    jira : {type : String},
    start : {type : Date, default : new Date()},
    end : {type : Date, default : null},
    stat : {type : Number, default : 1},
    progress : {type : Number, default : 0},
    uid : {type : String},
    remark : {type : Array, default : []}
});

module.exports = mongoose.model('Task', schema, 'tasks');