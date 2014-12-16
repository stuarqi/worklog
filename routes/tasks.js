var express = require('express');
var router = express.Router();
var Task = require('../lib/Task');
var Remark = require('../lib/Remark');
var validation = require('../lib/middleware/validation');

router.use(validation);

//任务列表
router.get('/', function (req, res) {
    Task.getList({
        uid : req.user._id
    }, function (err, list) {
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
    var task = verifyAddTask(req, res);
    if (task) {
        task.save(function (err) {
            if (err) {
                console.log(err);
                return showError(res, '添加失败');
            } else {
                res.redirect('/tasks');
            }
        });
    }
});

router.get('/:tid', function (req, res) {
    Task.getById(req.param('tid'), function (err, task) {
        if (err) {
            res.status(404);
            res.end('<h1>404</h1><h2>Not Found</h2>');
        } else {
            res.render('tasks/taskDetail', {
                title : '任务详情',
                task : task
            });
        }
    });
});

router.get('/:tid/update', function (req, res) {
    res.end(req.param('tid'));
});


function verifyAddTask (req, res) {
    var name = req.param('name').trim(),
        jira = req.param('jira').trim(),
        taskIntro = req.param('taskIntro').trim(),
        //stat = parseInt(req.param('stat')),
        //progress = req.param('progress'),
        //remark = req.param('remark').trim(),
        start, end = null, uid;
    if (!name) {
        return showError(res, '请填写任务名称');
    }
    if (!jira) {
        return showError(res, '请填写jira任务地址');
    }
    start = new Date();
    /*if (stat === 2) {
        //progress = 100;
        end = new Date();
    }*/
    uid = req.user['_id'];
    //remark = remark ? [new Remark(remark)] : [];

    return new Task({
        name : name,
        jira : jira,
        start : start,
        end : end,
        //stat : stat,
        //progress : progress,
        uid : uid,
        //remark : remark,
        taskIntro : taskIntro
    });
}
function showError(res, msg) {
    res.error(msg);
    res.redirect('back');
    return false;
}

module.exports = router;