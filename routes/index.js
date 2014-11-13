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

router.get('/register', function (req, res) {
  res.render('register', {
    title : '注册新账户'
  });
});

router.post('/register', function (req, res) {
    var user;
    if (user = verifyRegister(req, res)) {
        user.register(function (err) {
            console.log(err);
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
