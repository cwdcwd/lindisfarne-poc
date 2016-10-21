'use strict';

const _ = require('lodash');
const config = require('config');
const requestPromise = require('request-promise');
const qs = require('querystring');

var ZendeskWorker = function() {

};

ZendeskWorker.prototype.process = function(slackData, cb) {
    var self = this;
    console.log('slackData', slackData);

    let slackURL = config.SLACK_API_BASEURL + 'users.info';

    slackURL = slackURL + '?' + qs.stringify({
        token: slackData.token,
        user: slackData.user_id
    })

    let userP = requestPromise({
        method: 'GET',
        uri: slackURL,
        json: true
    });

    userP.then((userData) => {
        let userName = _.get(userData, 'user.real_name', slackData.user_name);
        let ticket = {
            "ticket": {
                "requester": {
                    "name": userName,
                    "email": _.get(userData, 'user.email', 'no@email.com')
                },
                "collaborators": {
                    "name": userName,
                    "email": _.get(userData, 'user.email', 'no@email.com')
                },
                //"submitter_id": 410989,
                "subject": userName + ' submitted an issue via slack',
                "comment": {
                    "body": slackData.text
                }
            }
        };
        var auth = Buffer.from(config.ZENDESK_USER + '/token:' + config.ZENDESK_USERTOKEN).toString(
            'base64');

        var p = requestPromise({
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth
            },
            uri: config.ZENDESK_TICKETSURL,
            json: true,
            body: ticket
        });

        p.then((resp) => {
            console.log(resp)
            cb(null, {
                msg: resp
            });
        }).catch((err, data) => {
            cb(err, {
                msg: data
            });
        });
    }).catch((err, data) => {
        cb(err, {
            msg: data
        });
    })


}

module.exports = ZendeskWorker;
