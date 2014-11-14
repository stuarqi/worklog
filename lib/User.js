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
User.exists = function (email, fn) {
    userModel.count({email : email}, function (err, count) {
        fn(err, count);
    });
};
User.existsByMark = function (mark, fn) {
    userModel.count({setPwdMark : mark}, function (err, count) {
        fn(err, count);
    });
};
User.getByEmail = function (email, fn) {
    userModel.findOne({email : email}, function (err, user) {
        if (err) {
            return fn(err);
        }
        fn(null, new User(user));
    });
};
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