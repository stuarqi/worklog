var bcrypt = require('bcrypt');
var userModel = require('../models/User');

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
                bcrypt.genSalt(12, function (err, salt) {
                    if (err) {
                        return fn({
                            code : 100,
                            msg : 'Server Error'
                        });
                    }
                    user.salt = salt;
                    bcrypt.hash(user.passwd, salt, function (err, hash) {
                        if (err) {
                            return fn({
                                code : 100,
                                msg : 'Server Error'
                            });
                        }
                        user.passwd = hash;
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

User.exists = function (email, fn) {
    userModel.count({email : email}, function (err, count) {
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