'use strict';
var User = require('../model/User.js');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/fail', function(req, res, next) {
    res.render('error', {
        message: 'fail whale. something went wrong!'
    });
});

router.get('/done', function(req, res, next) {
    res.render('done', {
        title: (req.query.type || 'Slack')
    });
});


router.get('/whoami', function(req, res, next) {
    console.log(req.session.userId);

    User.findById(req.session.userId, function(err, doc) {
        if (err) {
            res.redirect('/fail');
        } else {
            res.render('whoami', {
                user: doc
            });
        }
    });

});


module.exports = router;
