'use strict';

var _ = require('lodash');
var config = require('config');
var kue = require('kue');
var GarageBaerWorker = require('./workers/garagebaer');
var baer = new GarageBaerWorker(config.PHOTON_USERNAME, config.PHOTON_PASSWORD, config.PHOTON_DEVICEID);
var request = require('request');
var qs = require('querystring');
var queue = kue.createQueue({
    redis: config.REDIS_URL
});

queue.process('slackpost', function(job, done) {
    var jobData = job.data;
    jobData.processedDate = new Date();
    console.log(jobData);

    var cmdMap = [{
        command: '/garagebaer',
        processor: function(jd, cb) {
            baer.process(jd, cb);
        }
    }, {
        command: '/lindisfarne',
        processor: function(data, cb) {
            cb(null, data);
        }
    }];

    var cmd = _.find(cmdMap, {
        command: jobData.command
    });

    if (!cmd) {
        cmd = _.find(cmdMap, {
            command: '/lindisfarne'
        }); //CWD-- default to '/lindisfarne'
    }

    cmd.processor(jobData, function(err, data) {
        var payload = {
            token: config.SLACKBOT_TOKEN,
            channel: jobData.channel_id,
            text: JSON.stringify(err || data)
        };

        request({
            method: 'GET',
            url: 'https://slack.com/api/chat.postMessage?' + qs.stringify(payload)
        }, function(error, response, body) {
            console.log(error, body);
            done(error, body);
        })
    });

});
