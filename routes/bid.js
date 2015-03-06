var express = require('express');
var router = express.Router();
var Product = require('../models/Product');

var pageSize = 10;

router.get('/', function (req, res) {
    res.redirect('/products');
});

router.all('/products(/:page)?', function (req, res) {
    var page = req.params.page || '/1'
    page = page.substr(1)
    var total = 0
    var search = req.body.search
    var status = req.body.status || 'ongoing'
    var condition = {status: 1}
    if (search) {
        condition.description = new RegExp(search)
    }
    var now = new Date
    switch (status) {
        case 'finish':
            condition.end = {'$lt': now}
            break
        case 'start':
            condition.start = {'$gt': now}
            break
        case 'ongoing':
            condition.end = {'$gt': now}
            condition.start = {'$lt': now}
            break
        default :
    }
    Product.count(function (err, count) {
        if (err) {
            console.log(err)
        } else {
            total = count
            Product.find(condition, null, {
                skip: (page - 1) * pageSize,
                limit: pageSize,
                sort: 'field -lastModify'
            }, function (err, products) {
                if (err) {
                    console.log(err)
                } else {
                    res.render('products', {
                        title: '商品列表',
                        status: status,
                        products: products,
                        currentPage: page,
                        totalPages: Math.ceil(total / pageSize) || 1
                    });
                }
            })
        }
    })
})

router.get('/product/:id', function (req, res) {
    var id = req.params.id
    Product.findById(id, function (err, product) {
        if (err) {
            console.log(err)
        } else {
            res.render('product', {title: '竞拍商品', product: product});
        }
    })
})

module.exports = router;
