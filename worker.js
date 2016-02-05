'use strict';

var _ = require('lodash');
var config = require('config');
var kue = require('kue');
var GarageBaerWorker = require('./workers/garagebaer');
var SFDCWorker = require('./workers/sfdc');

var mongoose = require('mongoose');
var User = require('./model/User.js');

mongoose.connect(config.db);

mongoose.connection.on('connected', function() {
        console.log('connected to mongo db: ' + config.db);
    })
    .on('disconnected', function(err) {
        console.log('disconnected');
    })
    .on('error', function(err) {
        console.log('could not connect to mongo db: ', err);
        console.error.bind(console, 'connection error:');
    })
    .once('open', function(callback) {
        console.log('db opened: ', mongoose.connection.host + ':' + mongoose.connection.port);
    });

var normalizeWhitelist = function(wl) {
    var a = wl || [];

    if (_.isString(a)) {
        console.log('evaluating WHITELIST var', wl);
        a = eval(wl);

        if (!_.isArray(a)) {
            console.log('converting WHITELIST to array')
            a = [].push(wl);
        }
    }

    console.log('WHITELIST: ', a);
    return a;
};


var baer = new GarageBaerWorker(config.PHOTON_USERNAME, config.PHOTON_PASSWORD, config.PHOTON_DEVICEID,
    normalizeWhitelist(config.WHITELIST));
var sfdc = new SFDCWorker();
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
    }, {
        command: '/soql',
        processor: function(jd, cb) {
            sfdc.process(jd, cb);
        }
    }, {
        command: '/chatter',
        processor: function(jd, cb) {
            sfdc.process(jd, cb);
        }
    }, {
        command: '/case',
        processor: function(jd, cb) {
            sfdc.process(jd, cb);
        }
    }, {
        command: '/timecard',
        processor: function(jd, cb) {
            sfdc.process(jd, cb);
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
        var payload = { //CWD-- TODO : rework all this to dynamicaly goto channel or DM based on processor
            token: jobData.token, //config.SLACKBOT_TOKEN,
            channel: (data && data.channel_id) || jobData.channel_id,
            text: JSON.stringify(err || data.msg || data),
            attachments: (data && data.attachments) || null,
            username: config.BOTNAME
        };

        request({
            method: 'POST',
            url: 'https://slack.com/api/chat.postMessage',
            form: payload
        }, function(error, response, body) {
            console.log(error, body);
            done(error, body);
        })
    });

});
