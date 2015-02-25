var express = require('express');
var router = express.Router();

var Product = require('../../models/Product');

router.all(/^\/products(\/:page)?$/, function (req, res) {
    var pageSize = 2;
    var page = req.params.page || 1
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
            total = count || 1
        }
    })
    Product.find(condition, null, {skip: page * pageSize, limit: pageSize}, function (err, products) {
        if (err) {
            console.log(err)
        } else {
            console.log(products)
            console.log(page)
            console.log(total)
            res.render('manage/products', {
                title: '商品管理',
                user: req.session.user,
                products: products,
                currentPage: page,
                totalPages: Math.ceil(total / pageSize)
            });
        }
    })
});

router.get('/addProduct', function (req, res) {
    res.render('manage/addProduct', {title: '添加商品', user: req.session.user});
})

module.exports = router;
