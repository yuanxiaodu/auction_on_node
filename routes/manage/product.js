var express = require('express');
var router = express.Router();
var fs = require('fs');
var Product = require('../../models/Product');

router.all('/products(/:page)?', function (req, res) {
    var pageSize = 2;
    var page = req.params.page || '/1'
    page = page.substr(1)
    var total = 0
    var condition = req.body.condition
    if (!condition) {
        condition = null;
    } else {
        condition = {
            $or: [
                {name: new RegExp(condition)},
                {title: new RegExp(condition)}
            ]
        }
    }
    Product.count(function (err, count) {
        if (err) {
            console.log(err)
        } else {
            total = count
        }
    })
    Product.find(condition, null, {skip: (page - 1) * pageSize, limit: pageSize}, function (err, products) {
        if (err) {
            console.log(err)
        } else {
            res.render('manage/products', {
                title: '商品管理',
                user: req.session.user,
                products: products,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize) || 1
            });
        }
    })
});

router.get('/addProduct', function (req, res) {
    res.render('manage/addProduct', {title: '添加商品', user: req.session.user});
})

router.post('/addProduct', function (req, res) {
    var files = req.files.pictures,
        startPrice = req.body.startPrice,
        markup = req.body.markup,
        start = new Date(req.body.start),
        end = new Date(req.body.end),
        catalog = req.body.catalog,
        description = req.body.description;

    var preg = /^[1-9]{1}[0-9]{0,10}[.]{0,1}[0-9]{0,2}$/
    if (!preg.test(startPrice) || !preg.test(markup)) {
        if (files) {
            if (files.length) {
                for (var index in files) {
                    fs.unlinkSync(files[index].path)
                }
            } else {
                fs.unlinkSync(files.path)
            }
        }
        res.send({code: 'failed', msg: '价格格式为 XX.XX'})
    } else if (start > end) {
        if (files) {
            if (files.length) {
                for (var index in files) {
                    fs.unlinkSync(files[index].path)
                }
            } else {
                fs.unlinkSync(files.path)
            }
        }
        res.send({code: 'failed', msg: '起拍时间不能晚于结束时间'})
    } else {
        var pictures = new Array()
        if (files) {
            if (files.length) {
                for (var index in files) {
                    fs.renameSync(files[index].path, fs.realpathSync('../public/images/') + '/' + files[index].name)
                    pictures.push({
                        originalname: files[index].originalname,
                        name: files[index].name
                    })
                }
            } else {
                fs.renameSync(files.path, fs.realpathSync('../public/images/') + '/' + files.name)
                pictures.push({
                    originalname: files.originalname,
                    name: files.name
                })
            }
        }
        var product = new Product({
            pictures: pictures,
            startPrice: startPrice,
            markup: markup,
            start: start,
            end: end,
            catalog: catalog,
            description: description,
            status: 0,
            lastModify: new Date,
            modifier: req.session.user.username
        })
        product.save(function (err) {
            if (err) {
                console.log(err)
            } else {
                res.send({code: 'success'})
            }
        })
    }
})

module.exports = router;
