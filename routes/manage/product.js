var express = require('express');
var router = express.Router();
var fs = require('fs');
var Product = require('../../models/Product');

var pageSize = 10;
router.all('/products(/:page)?', function (req, res) {
    var page = req.params.page || '/1'
    page = page.substr(1)
    var total = 0
    var condition = req.body.condition
    if (!condition) {
        condition = null;
    } else {
        condition = {
            description: new RegExp(condition)
        }
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
                    res.render('manage/products', {
                        title: '商品管理',
                        user: req.session.user,
                        products: products,
                        currentPage: page,
                        totalPages: Math.ceil(total / pageSize) || 1
                    });
                }
            })
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
    if (!files.length) {
        files = [files]
    }
    var preg = /^[1-9]{1}[0-9]{0,10}[.]{0,1}[0-9]{0,2}$/
    if (!preg.test(startPrice) || !preg.test(markup)) {
        for (var index in files) {
            fs.unlinkSync(files[index].path)
        }
        res.send({code: 'failed', msg: '价格格式为 XX.XX'})
    } else if (start > end) {
        for (var index in files) {
            fs.unlinkSync(files[index].path)
        }
        res.send({code: 'failed', msg: '起拍时间不能晚于结束时间'})
    } else {
        var pictures = new Array()
        for (var index in files) {
            fs.renameSync(files[index].path, fs.realpathSync('../public/images/') + '/' + files[index].name)
            pictures.push({
                originalname: files[index].originalname,
                name: files[index].name
            })
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

router.get('/modifyProduct/:id/:status', function (req, res) {
    var id = req.params.id,
        status = req.params.status,
        status = status == 0 ? 1 : 0
    Product.findByIdAndUpdate(id, {
        status: status,
        lastModify: new Date,
        modifier: req.session.user.username
    }, function (err) {
        if (err) {
            console.log(err)
            res.send({code: 'failed'})
        } else {
            res.send({code: 'success'})
        }
    })
})

router.get('/modifyProduct/:id', function (req, res) {
    var id = req.params.id
    Product.findById(id, {}, function (err, product) {
        if (err) {
            console.log(err)
        } else {
            res.render('manage/modifyProduct', {title: '编辑商品', product: product, user: req.session.user});
        }
    })
})

router.post('/modifyProduct/:id', function (req, res) {
    var id = req.params.id
    var files = req.files.pictures,
        startPrice = req.body.startPrice,
        markup = req.body.markup,
        start = new Date(req.body.start),
        end = new Date(req.body.end),
        catalog = req.body.catalog,
        description = req.body.description;
    if (files) {
        if (!files.length) {
            files = [files]
        }
    }
    var preg = /^[1-9]{1}[0-9]{0,10}[.]{0,1}[0-9]{0,2}$/
    if (!preg.test(startPrice) || !preg.test(markup)) {
        if (files) {
            for (var index in files) {
                fs.unlinkSync(files[index].path)
            }
        }
        res.send({code: 'failed', msg: '价格格式为 XX.XX'})
    } else if (start > end) {
        if (files) {
            for (var index in files) {
                fs.unlinkSync(files[index].path)
            }
        }
        res.send({code: 'failed', msg: '起拍时间不能晚于结束时间'})
    } else {
        if (files) {
            for (var index in files) {
                fs.renameSync(files[index].path, fs.realpathSync('../public/images/') + '/' + files[index].name)
                Product.findByIdAndUpdate(id, {
                    $push: {
                        pictures: {
                            originalname: files[index].originalname,
                            name: files[index].name
                        }
                    }
                }, function (err) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
        }
        Product.findByIdAndUpdate(id, {
            startPrice: startPrice,
            markup: markup,
            start: start,
            end: end,
            catalog: catalog,
            description: description,
            lastModify: new Date,
            modifier: req.session.user.username
        }, function (err) {
            if (err) {
                console.log(err)
            } else {
                res.send({code: 'success'})
            }
        })

    }

})

router.post('/deletePicture/:id', function (req, res) {
    var id = req.params.id
    var name = req.body.key
    Product.findByIdAndUpdate(id, {
        $pull: {pictures: {name: name}},
        lastModify: new Date,
        modifier: req.session.user.username
    }, function (err) {
        if (err) {
            console.log(err)
        } else {
            fs.unlinkSync(fs.realpathSync('../public/images/') + '/' + name)
            res.send({code: 'success'})
        }
    })
})

router.post('/uploadPicture/:id', function (req, res) {
    var id = req.params.id
    var picture = req.files.pictures
    Product.findByIdAndUpdate(id, {
        $push: {pictures: {originalname: picture.originalname, name: picture.name}},
        lastModify: new Date,
        modifier: req.session.user.username
    }, function (err, product) {
        if (err) {
            console.log(err)
        } else {
            fs.renameSync(picture.path, fs.realpathSync('../public/images/') + '/' + picture.name)
            res.send({code: 'success', picture: {originalname: picture.originalname, name: picture.name}})
        }
    })

})

module.exports = router;
