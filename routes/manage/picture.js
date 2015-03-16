var express = require('express');
var router = express.Router();
var fs = require('fs');
var Picture = require('../../models/Picture');

var pageSize = 50;
router.all('/pictures(/:page)?', function (req, res) {
    var page = req.params.page || '/1'
    page = page.substr(1)
    var total = 0
    var search = req.body.search || req.query.search
    var condition = {}
    if (search) {
        condition.description = new RegExp(search)
    }
    Picture.count(condition, function (err, count) {
        if (err) {
            console.log(err)
        } else {
            total = count
            Picture.find(condition, null, {
                skip: (page - 1) * pageSize,
                limit: pageSize,
                sort: 'field -lastModify'
            }, function (err, pictures) {
                if (err) {
                    console.log(err)
                } else {
                    res.render('manage/pictures', {
                        title: '图片管理',
                        search: search,
                        user: req.session.user,
                        pictures: pictures,
                        currentPage: page,
                        totalPages: Math.ceil(total / pageSize) || 1
                    });
                }
            })
        }
    })
});

router.post('/addPicture', function (req, res) {
    var file = req.files.picture
    if (!/^(gif|jpe?g|png|GIF|JPE?G|PNG)$/.test(file.extension)) {
        fs.unlinkSync(file.path)
        res.send({code: 'failed', msg: '只允许上传图片！'})
    } else {
        var picture = new Picture({
            name: file.name,
            originalname: file.originalname,
            description: req.body.description || '',
            lastModify: new Date
        })
        fs.renameSync(file.path, fs.realpathSync('../public/images/') + '/' + file.name)
        picture.save(function (err) {
            if (err) {
                console.log(err)
            } else {
                res.send({code: 'success'})
            }
        })
    }
})

router.get('/deletePicture/:id', function (req, res) {
    var id = req.params.id
    Picture.findById(id, function (err, picture) {
        if (err) {
            console.log(err)
        } else {
            fs.unlinkSync(fs.realpathSync('../public/images/') + '/' + picture.name)
            Picture.remove(picture, function (err) {
                if (err) {
                    console.log(err)
                    res.send({code: 'failed'})
                } else {
                    res.send({code: 'success'})
                }
            })
        }
    })
})

module.exports = router;
