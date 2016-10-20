'use strict';

var _ = require('lodash');
var config = require('config');
var requestPromise = require('request-promise');

var ZendeskWorker = function() {

};

ZendeskWorker.prototype.process = function(slackData, cb) {
    var self = this;
    console.log('slackData', slackData);
    //if (slackData.text === 'hello') {
    let ticket = {
        "ticket": {
            "requester": {
                "name": "Slack Test",
                "email": "thecustomer@domain.com"
            },
            "submitter_id": 410989,
            "subject": "My internet pipe is clogged!",
            "comment": {
                "body": "The hard drive is overflowing all over the floor."
            }
        }
    };
    var auth = Buffer.from(config.ZENDESK_USER + '/token:' + config.ZENDESK_USERTOKEN).toString('base64');

    var obj = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth
        },
        uri: config.ZENDESK_TICKETSURL,
        json: true,
        body: ticket
    };

    var p = requestPromise(obj);
    p.then(function(resp) {
        console.log(resp)
        cb(null, {
            msg: resp
        });
    }).catch(function(err, data) {
        cb(err, {
            msg: data
        });
    });
    /*    } else {
            cb('I really am not sure what you are on about');
        }
    */
}

module.exports = ZendeskWorker;
