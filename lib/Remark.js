var taskModel = require('../models/Task');

function Remark(content) {
    this.date = new Date();
    this.content = content;
}

module.exports = Remark;

Remark.prototype = {
    constructor : Remark,
    save : function (taskId, fn) {
        taskModel.updateById(taskId, {
            $push : {
                remark : {
                    date : this.date,
                    content : this.content
                }
            }
        }, function (err, doc) {
            if (err) {
                return fn(err);
            } else {
                fn(err, doc);
            }
        });
    }
};