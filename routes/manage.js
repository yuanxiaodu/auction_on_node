var express = require('express');
var router = express.Router();

var User = require('../models/User');

/* manage home page. */
router.get(/^\/(login)?$/, function (req, res) {
    res.render('manage/login', {title: '后台管理登录'});
});

router.post('/login', function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    User.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            if (!user || user.password != password) {
                res.send({code:'failed', msg:'用户名或密码错误'});
            } else {
                res.send({code:'success'});
            }
        }
    });
});
router.get('/user', function (req, res) {
    res.render('manage/user');
});

module.exports = router;
