var User = require('../User');

module.exports = function (req, res, next) {

    var uid = req.session.uid || req.cookies['uid'];
    if (!uid) {
        return next();
    }
    User.getById(uid, function (err, user) {
        if (err) {
            return next();
        }
        req.user = res.locals.user = user;
        next();
    });
};