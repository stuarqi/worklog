var express = require('express');
var router = express.Router();
var Task = require('../lib/task');

//任务列表
router.get('/', function (req, res) {
    Task.getListByUid(req.user._id, function (list) {
        res.render('tasks/list', {
            tasks : list
        });
    });
});

//新建任务
router.get('/add', function (req, res) {
    res.render('tasks/add', {});
});

router.post('/add', function (req, res) {
    /*console.log(req.param('endDate'));
    res.end('OK');*/
    var task = new Task({
        name : req.param('taskName'),
        jira : req.param('jira'),
        end : new Date(req.param('endDate')),
        uid : req.user._id
    });
    task.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/tasks');
        }
    });
});

module.exports = router;