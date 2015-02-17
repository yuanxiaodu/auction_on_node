var express = require('express');
var router = express.Router();

var User = require('../models/User');

//登录验证过滤器
router.all('*', function (req, res, next) {
    var path = req.path;
    if (/^\/(login)?$/.test(path) || req.session.user) {
        next();
    } else if (req.cookies.username) {
        User.findOne({username: req.cookies.username}, function (err, user) {
            if (err) {
                console.log(err)
            } else {
                req.session.user = user;
                next();
            }
        })
    } else {
        res.redirect('/manage/login');
    }
});

router.get(/^\/(login)?$/, function (req, res) {
    if (req.session.user) {
        res.redirect('/manage/products');
    } else {
        res.render('manage/login', {title: '后台管理登录'});
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
    res.redirect('/manage/login')
})

router.get('/user', function (req, res) {
    res.render('manage/user', {title: '资料管理', user: req.session.user});
});

router.get('/modifyUser', function (req, res) {
    res.render('manage/modifyUser', {title: '资料修改', user: req.session.user});
});

router.post('/modifyUser', function (req, res) {
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    var rePassword = req.body.rePassword;
    if (password != rePassword) {
        res.send({code: 'failed', msg: '两次输入密码不一致'})
    } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
        res.send({code: 'failed', msg: '电子邮件格式不正确'})
    } else if (!/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(phone)) {
        res.send({code: 'failed', msg: '电话号码格式不正确'})
    } else {
        User.findOneAndUpdate(req.session.user, {
            email: email,
            phone: phone,
            password: password,
            lastModify: new Date,
            modifier: req.session.user.username
        }, function (err, user) {
            if (err) {
                console.log(err)
            } else {
                req.session.user = user
                res.send({code: 'success'})
            }
        })
    }
});

router.get('/users', function (req, res) {
    if (req.session.user.type != 1) {
        res.redirect('/manage/user');
    } else {
        User.find({type: {$ne: 1}}, function (err, users) {
            if (err) {
                console.log(err)
            } else {
                res.render('manage/users', {title: '用户管理', user: req.session.user, users: users});
            }
        })
    }
});

router.post('/addUser', function (req, res) {
    if (req.session.user.type != 1) {
        res.redirect('/manage/user');
    } else {
        var user = new User({
            username: req.body.username,
            password: 'luoboloop',
            type: 2,
            lastModify: new Date,
            modifier: req.session.user.username
        })
        user.save(function (err, user) {
            if (err) {
                console.log(err);
                res.send({code: 'failed', msg: '用户名已存在'})
            } else {
                res.send({code: 'success', username: user.username})
            }
        })
    }
});

router.post('/delUser', function (req, res) {
    if (req.session.user.type != 1) {
        res.redirect('/manage/user');
    } else {
        User.findOneAndRemove({username: req.body.username}, function (err, user) {
            if (err) {
                console.log(err)
                res.send({code: 'failed', msg: '数据库错误'})
            } else {
                res.send({code: 'success'})
            }
        })
    }
});

router.get('/products', function (req, res) {
    res.render('manage/products', {title: '商品管理', user: req.session.user});
});

module.exports = router;
