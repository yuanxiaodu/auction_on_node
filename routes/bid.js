var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
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
    Product.findById(req.params.id, function (err, product) {
        if (err) {
            console.log(err)
        } else {
            if (product.bidders.length) {
                Product.aggregate([
                    {$match: {_id: mongoose.Types.ObjectId(req.params.id)}},
                    {$unwind: '$bidders'},
                    {$sort: {'bidders.price': -1}}
                ], function (err, doc) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.render('product', {title: '竞拍商品', product: doc[0]});
                    }
                })
            } else {
                res.render('product', {title: '竞拍商品', product: product});
            }
        }
    })
})

router.post('/product/:id/bid', function (req, res) {
    var price = req.body.price,
        name = req.body.name,
        phone = req.body.phone
    if (!/^[1-9]{1}[0-9]{0,10}[.]{0,1}[0-9]{0,2}$/.test(price)) {
        res.send({code: 'failed', msg: '价格格式为 XX.XX'})
    } else if (!/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(phone)) {
        res.send({code: 'failed', msg: '电话号码格式不正确'})
    } else {
        Product.findById(req.params.id, function (err, product) {
            if (err) {
                console.log(err)
            } else {
                if (product.bidders.length) {
                    Product.aggregate([
                        {$match: {_id: mongoose.Types.ObjectId(req.params.id)}},
                        {$unwind: '$bidders'},
                        {$sort: {'bidders.price': -1}}
                    ], function (err, doc) {
                        if (err) {
                            console.log(err)
                        } else {
                            if (price < doc[0].bidders.price) {
                                res.send({code: 'failed', msg: '出价太低'})
                            } else {
                                Product.findByIdAndUpdate(req.params.id, {
                                    $push: {
                                        bidders: {
                                            name: name,
                                            phone: phone,
                                            price: price,
                                            bidTime: new Date
                                        }
                                    }
                                }, function (err) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        res.send({code: 'success'})
                                    }
                                })
                            }
                        }
                    })
                } else {
                    if (price < product.startPrice) {
                        res.send({code: 'failed', msg: '出价太低'})
                    } else {
                        Product.findByIdAndUpdate(req.params.id, {
                            $push: {
                                bidders: {
                                    name: name,
                                    phone: phone,
                                    price: price,
                                    bidTime: new Date
                                }
                            }
                        }, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                res.send({code: 'success'})
                            }
                        })
                    }
                }
            }
        })
    }
})

module.exports = router;
