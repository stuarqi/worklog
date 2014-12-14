var bcrypt = require('bcrypt');
var userModel = require('../models/User');
var sendmail = require('sendmail')();
//var Email = require('email').Email;

var reg = /[\\\/]/g;

function User(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

module.exports = User;

User.prototype = {
    constructor : User,

    /**
     * 注册用户
     * @param {function} fn 回调方法
     */
    register : function (fn) {
        var user = this;
        User.exists(this.email, function (err, count) {
            if (err) {
                return fn({
                    code : 0,
                    msg : 'Database Error'
                });
            }
            if (count === 0) {
                encrypt(user.passwd, function (result, salt) {
                    user.salt = salt;
                    user.passwd = result;
                    userModel.create(user, function (err) {
                        if (err) {
                            return fn({
                                code : 0,
                                msg : 'Database Error'
                            });
                        }
                        fn();
                    });
                });
            } else {
                fn({
                    code : 20,
                    msg : 'Email alerady taken'
                });
            }
        });
    }
};

/**
 * 重置密码
 * @param {string} mark 重置密码标识
 * @param {string} passwd 新密码
 * @param {function} fn 回调方法
 */
User.resetPass = function (mark, passwd, fn) {
    encrypt(passwd, function (result, salt) {
        userModel.findOneAndUpdate({setPwdMark : mark}, {$set : {
            salt : salt,
            passwd : result,
            setPwdMark : ''
        }}, function (err, doc) {
            if (doc) {
                fn();
            } else {
                fun({
                    code : 0,
                    msg : 'Internal Error'
                });
            }
        });
    });
};

/**
 * 发送重置密码
 * @param {string} email 电子邮件地址
 * @param {function} fn 回调方法
 */
User.toResetPass = function (email, fn) {
    encrypt(email, function (result, salt) {
        result = result.replace(reg, '');
        userModel.findOneAndUpdate({email : email}, {$set : {setPwdMark : result}}, function (err, doc) {
            if (doc) {
                var cbk = 1;
                sendmail({
                    from : 'service@worklog.com',
                    to : email,
                    subject : 'WorkLog密码重置',
                    content : doc.name + '你好：<br/>请访问下面的链接重置登录密码：<br/>http://localhost:3000/resetPwd/' + result
                }, function (err, reply) {
                    if (cbk--) {
                        if (reply) {
                            fn();
                        } else {
                            return fn({
                                code: 1,
                                msg: 'Email send error'
                            });
                        }
                    }
                });
            } else {
                return fn({
                    code : 0,
                    msg : 'Email not exists'
                });
            }
        });
    });
};

/**
 * 检查电子邮件是否已注册
 * @param {string} email 电子邮件地址
 * @param {function} fn 回调方法
 */
User.exists = function (email, fn) {
    userModel.count({email : email}, function (err, count) {
        fn(err, count);
    });
};

/**
 * 重置密码标识是否存在
 * @param {string} mark 重置密码标识
 * @param {function} fn 回调方法
 */
User.existsByMark = function (mark, fn) {
    userModel.count({setPwdMark : mark}, function (err, count) {
        fn(err, count);
    });
};

/**
 * 根据电子邮件获取用户信息
 * @param {string} email 电子邮件地址
 * @param {function} fn 回调方法
 */
User.getByEmail = function (email, fn) {
    userModel.findOne({email : email}, function (err, user) {
        if (err) {
            return fn(err);
        }
        fn(null, new User(user));
    });
};

/**
 * 通过ID获取用户信息
 * @param {string} id 用户ID
 * @param {function} fn 回调方法
 */
User.getById = function (id, fn) {
    userModel.findOne({_id : id}, function (err, user) {
        if (err) {
            return fn({
                code : 0,
                msg : 'Database Error'
            });
        }
        fn(null, new User(user));
    });
};

/**
 * 验证并获取用户信息
 * @param {string} email 电子邮件
 * @param {string} passwd 登录密码
 * @param {function} fn 回调方法
 */
User.getAndVerify = function (email, passwd, fn) {
    userModel.findOne({email : email}, function (err, user) {
        if (err) {
            return fn(err);
        }
        user = new User(user);
        var pwd = user.passwd;
        if (user.salt !== '') {
            bcrypt.hash(passwd, user.salt, function (err, hash) {
                if (err) {
                    return fn(err);
                }
                if (hash === pwd) {
                    fn(null, user);
                } else {
                    return fn(true);
                }
            });
        } else {
            if (pwd === passwd) {
                fn(null, user);
            } else {
                return fn(true);
            }
        }
    });
};


/**
 * 加密数据
 * @param {string} data 待加密字符串
 * @param {function} fn 加密后的回调方法，返回加密后的内容和密钥
 */
function encrypt(data, fn) {
    bcrypt.genSalt(12, function (err, salt) {
        if (err) {
            throw err;
        }
        bcrypt.hash(data, salt, function (err, result) {
            if (err) throw err;
            fn(result, salt);
        });
    });
}