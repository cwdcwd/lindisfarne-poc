'use strict';

var config = require('config');
var kue = require('kue');
var request = require('request');
var qs = require('querystring');
var queue = kue.createQueue({
    redis: config.REDIS_URL
});

queue.process('slackpost', function(job, done) {
    var data = job.data;
    data.processedDate = new Date();
    var payload = {
        token: config.SLACKBOT_TOKEN,
        channel: data.channel_id,
        text: JSON.stringify(data)
    };

    request({
        method: 'GET',
        url: 'https://slack.com/api/chat.postMessage?' + qs.stringify(payload)
    }, function(error, response, body) {
        console.log(error, body);
        done(error, body);
    })
});
