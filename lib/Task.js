var taskModel = require('../models/Task');

function Task(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

module.exports = Task;

Task.prototype = {
    constructor : Task,
    /**
     * 保存当前对象
     * @param fn
     */
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
    /**
     * 更新当前对象
     * @param update
     * @param fn
     */
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

/**
 * 根据编号更新指定的任务
 * @param id
 * @param update
 * @param fn
 */
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

/**
 * 暂停任务
 * @param id
 * @param fn
 */
Task.pause = function (id, fn) {
    Task.updateById(id, {$set : {stat : 0}}, fn);
};

/**
 * 继续任务
 * @param id
 * @param fn
 */
Task.continue = function (id, fn) {
    Task.updateById(id, {$set : {stat : 1}}, fn);
};

/**
 * 完成任务
 * @param id
 * @param fn
 */
Task.complete = function (id, fn) {
    Task.updateById(id, {$set : {stat : 2}}, fn);
};

