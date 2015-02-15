var express = require('express');
var router = express.Router();

/* manage home page. */
router.get('/', function(req, res, next) {
  res.render('./manage/login', { title: '后台管理登录' });
});

module.exports = router;
