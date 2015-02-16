var express = require('express');
var router = express.Router();

var User = require('../models/User');

//登录验证过滤器
router.all('*', function (req, res, next) {
    var path = req.path;
    if (!(/^\/(login)?$/.test(path)) && !req.session.user) {
        res.redirect('/manage/login');
    } else {
        next();
    }
});

router.get(/^\/(login)?$/, function (req, res) {
    if (req.session.user) {
        res.redirect('/manage/user');
    } else {
        if (req.cookies.username) {
            User.findOne({username: req.cookies.username}, function (err, user) {
                if (err) {
                    console.log(err)
                } else {
                    req.session.user = user;
                    res.redirect('/manage/user');
                }
            })
        } else {
            res.render('manage/login', {title: '后台管理登录'});
        }
    }
});

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            if (!user || user.password != password) {
                res.send({code: 'failed', msg: '用户名或密码错误'});
            } else {
                if (req.body.remember == 'on') {
                    var week = 7 * 24 * 3600000
                    res.cookie('username', user.username, {
                        path: '/manage',
                        expires: new Date(Date.now() + week),
                        maxAge: week
                    })
                }
                req.session.user = user;
                res.send({code: 'success'});
            }
        }
    });
});

router.get('/logout', function (req, res) {
    res.clearCookie('username', {path: '/manage'})
    req.session.destroy();
    res.redirect('/manage/user')
})

router.get('/user', function (req, res) {
    res.render('manage/user', {title: '资料管理', user: req.session.user});
});

module.exports = router;
