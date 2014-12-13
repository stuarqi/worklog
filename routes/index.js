var express = require('express');
var router = express.Router();
var User = require('../lib/User');

var regEmail = /[a-z0-9-.]{1,30}@[a-z0-9-]{1,65}.(com|net|org|info|biz|([a-z]{2,3}.[a-z]{2}))/;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title : 'Work Log'
    });
});

//登录处理
router.get('/login', function(req, res) {
  res.render('login', { title: 'Work Log' });
});
router.post('/login', function (req, res) {
    var info;
    if (info = verifyLogin(req, res)) {
        User.getAndVerify(info.email, info.passwd, function (err, user) {
            if (err) {
                return showError(res, '电子邮件或密码不正确');
            }
            req.session.uid = user._id;
            res.redirect('/');
        });
    }
});
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) throw err;
        res.redirect('/');
    });
});

//找回密码
router.get('/forgetLogin', function (req, res) {
    res.render('forgetLogin', {
        title : '重置密码'
    });
});

//提交找回密码
router.post('/forgetLogin', function (req, res) {
    var email = req.param('email');
    if (email.trim() === '') {
        return showError(res, '必须输入电子邮件地址');
    }
    if (!regEmail.test(email)) {
        return showError(res, '请输入有效的电子邮件地址');
    }
    User.toResetPass(email, function (err, reply) {
        if (err) {
            return showError(res, err.code === 0 ? '邮件地址不存在' : '邮件发送失败，请再试一次');
        } else {
            res.render('emailSended', {
                title: '重置密码'
            });
        }
    });
});

//重置密码页面
router.get('/resetPwd/:mark', function (req, res) {
    var mark = req.param('mark');
    User.existsByMark(mark, function (err, count) {
        if (err) throw err;
        if (count === 1) {
            res.render('resetPwd', {
                title : '重置密码',
                mark : mark
            });
        } else {
            res.redirect('/');
        }
    });
});

//提交重置密码
router.post('/resetPwd', function (req, res) {
    var passwd = req.param('passwd').trim(),
        repass = req.param('repass').trim(),
        mark = req.param('mark').trim();
    if (passwd === '') {
        return showError(res, '必须输入新密码');
    }
    if (passwd !== repass) {
        return showError(res, '两次输入的密码不相同');
    }
    User.resetPass(mark, passwd, function (err) {
        if (err) {
            return showError(res, '内部错误，请重试');
        }
        res.render('resetPwdSuccess', {
            title : '重置密码'
        });
    });
});


//注册账户
router.get('/register', function (req, res) {
  res.render('register', {
    title : '注册新账户'
  });
});

//提交注册
router.post('/register', function (req, res) {
    var user;
    if (user = verifyRegister(req, res)) {
        user.register(function (err) {
            if (err) {
                return showError(res, err.code === 20 ? '电子邮件地址已存在' : '内部错误');
            } else {
                res.render('registerSuccess', {
                    title : '注册成功',
                    user : user
                });
            }
        });
    }
});


function verifyRegister(req, res) {
    var email = req.param('email'),
        name = req.param('name'),
        passwd = req.param('passwd'),
        verifyPasswd = req.param('verifyPasswd');
    if (email.trim() === '') {
        return showError(res, '电子邮件必须填写');
    }
    if (!regEmail.test(email)) {
        return showError(res, '电子邮件格式不正确');
    }
    if (name.trim() === '') {
        return showError(res, '真实姓名必须填写');
    }
    if (passwd.trim() === '') {
        return showError(res, '登录密码必须填写');
    }
    if (verifyPasswd.trim() === '') {
        return showError(res, '密码验证必须填写');
    }
    if (passwd !== verifyPasswd) {
        return showError(res, '两次输入的密码不相同');
    }
    return new User({
        email : email,
        name : name,
        passwd : passwd
    });
}

function verifyLogin(req, res) {
    var email = req.param('email'),
        passwd = req.param('passwd');
    if (email.trim() === '') {
        return showError(res, '电子邮件必须填写');
    }
    if (passwd.trim() === '') {
        return showError(res, '登录密码必须填写');
    }
    return {
        email : email,
        passwd : passwd
    };
}

function showError(res, msg) {
    res.error(msg);
    res.redirect('back');
    return false;
}

module.exports = router;
