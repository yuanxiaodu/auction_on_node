var express = require('express');
var router = express.Router();

var User = require('../models/User');

/* manage home page. */
router.get('/', function (req, res) {
    res.render('./manage/login', {title: '后台管理登录'});
});

router.post('/login', function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    User.find(function (err, obj) {
        res.send({title: '用户名或密码错误', error: '用户名或密码错误'});
    });


    //if (User.validatePassword(username, req.param('password'))) {
    //    User.findOne({username: username}, function (err, adventure) {
    //        console.log(err);
    //        console.log(adventure);
    //        res.render('./manage/user')
    //    })
    //} else {
    //    res.render('./manage/login', {title: '用户名或密码错误', msg: '用户名或密码错误'});
    //}
});

module.exports = router;
