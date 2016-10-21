'use strict';

var config = require('config');
var express = require('express');
var router = express.Router();

var kue = require('kue');
var queue = kue.createQueue({
    redis: config.REDIS_URL
});


var fCreateJob = function(payload) {
    console.log(payload);
    payload.receivedDate = new Date();
    var job = queue.create('slackpost', payload).removeOnComplete(true).save(function(err) {
        if (err) {
            console.log(err);
        } else {
            job.data.queuedDate = new Date();
            console.log('posted report job: ', job.id);
        }
    });

    job.on('complete', function(result) {
        console.log('job done!', result);
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var payload = req.query;
    fCreateJob(payload);

    res.json({
        text: 'message received' + new Date()
    });
});

router.post('/', function(req, res, next) {
    var payload = req.body;
    fCreateJob(payload);

    res.json({
        text: 'message received' + new Date()
    });
});

module.exports = router;

//?token=WLCnIFkSWh5y29AbQw5vEymF&team_id=T03LNH8MS&team_domain=tcca&channel_id=D03LQAFV8&channel_name=directmessage&user_id=U03LQAFUA&user_name=lazybaer&command=%2Flindisfarne&text=testing+send&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT03LNH8MS%2F15950048273%2F0ap3spXIDfod2aiYGlZThW2i
/*
token=WLCnIFkSWh5y29AbQw5vEymF
team_id=T0001
team_domain=example
channel_id=C2147483705
channel_name=test
user_id=U2147483697
user_name=Steve
command=/weather
text=94070
*/
