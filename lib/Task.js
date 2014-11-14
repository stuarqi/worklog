var taskModel = require('../models/Task');

function Task(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

module.exports = Task;

Task.prototype = {
    constructor : Task,
    save : function (fn) {
        if (this._id) {
            this.update(fn);
        } else {
            taskModel.create(this, function (err) {
                if (err) {
                    return fn(err);
                }
                fn();
            });
        }
    },
    update : function (update, fn) {
        if (!fn) {
            fn = update;
            update = null;
        }
        taskModel.findOneAndUpdate({_id : this._id}, update || this, function (err, doc) {
            if (err) {
                return fn(err);
            }
            if (doc) {
                fn();
            } else {
                fn({
                    code : 0,
                    msg : 'Not Found'
                });
            }
        });
    }
};

Task.updateById = function (id, update, fn) {
    taskModel.findOneAndUpdate({_id : id}, update, function (err, doc) {
        if (err) throw err;
        if (doc) {
            fn(null, doc);
        } else {
            fn({
                code : 0,
                msg : 'Not Found'
            });
        }
    });
};

Task.pause = function (id, fn) {
    Task.updateById(id, {$set : {stat : 0}}, fn);
};

Task.continue = function (id, fn) {
    Task.updateById(id, {$set : {stat : 1}}, fn);
};

Task.complete = function (id, fn) {
    Task.updateById(id, {$set : {stat : 2}}, fn);
};

