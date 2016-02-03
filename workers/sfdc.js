var _ = require('lodash');
var config = require('config');
var nforce = require('nforce');
chatter = require('nforce-chatter')(nforce);
var User = require('../model/User.js');


var SFDCWorker = function() {

    this.org = nforce.createConnection({
        clientId: config.SFDC_KEY,
        clientSecret: config.SFDC_PASS,
        redirectUri: 'http://localhost:3000/sfdc/oauth_callback',
        apiVersion: 'v35.0', // optional, defaults to current salesforce API version
        environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
        mode: 'multi', // optional, 'single' or 'multi' user mode, multi default
        autoRefresh: true,
        plugins: ['chatter']
    });
}

SFDCWorker.prototype.chatter = function(user, slackData, cb) {
    var self = this;
    var id = _.last(_.split(user.sfdc.id, '/'));
    console.log('posting to ' + id + ' with ' + slackData.text);
    self.org.chatter.postFeedItem({
        oauth: user.sfdc,
        id: id,
        text: slackData.text
    }, function(e, c) {
        cb(e, {
            channel_id: user.slack.id,
            msg: c
        })
    });
}

SFDCWorker.prototype.soql = function(user, slackData, cb) {
    var self = this;

    console.log('query with ' + slackData.text);
    self.org.query({
        oauth: user.sfdc,
        query: slackData.text
    }, function(e, c) {
        //console.log(c);
        var att = [];

        _.forEach(c.records, function(r) {
            console.log(r);
            var a = {
                'pretext': r.attributes.type,
                'title': r.attributes.type,
                'mrkdwn_in': ['text', 'pretext']
            };

            _.mapKeys(r._fields, function(v, k) {
                a.text = '*' + k + '*: ' + v + '\n' + a.text;
                //                a.fallback = k + ': ' + v;
            });

            att[att.length] = a;
        });

        cb(e, {
            channel_id: user.slack.id,
            msg: slackData.text,
            attachments: JSON.stringify(att)
        })
    });
}

SFDCWorker.prototype.timecard = function(user, slackData, cb) {
    var self = this;
    var caseObj = nforce.createSObject('Case');
    caseObj.set('Description', slackData.text);

    console.log('creating  case with ' + slackData.text);
    self.org.insert({
        sobject: caseObj,
        oauth: user.sfdc
    }, function(e, c) {
        cb(e, {
            channel_id: user.slack.id,
            msg: c
        })
    });
}

SFDCWorker.prototype.case = function(user, slackData, cb) {
    var self = this;
    var caseObj = nforce.createSObject('Case');
    caseObj.set('Description', slackData.text);

    console.log('creating  case with ' + slackData.text);
    self.org.insert({
        sobject: caseObj,
        oauth: user.sfdc
    }, cb);
}

SFDCWorker.prototype.identity = function(user, slackData, cb) {
    var self = this;

    self.org.getIdentity({
        oauth: user.sfdc
    }, function(err, res) {
        if (err) throw err;
        console.log(res);
        cb('', res); //CWD-- just send back payload for now
    });
}

SFDCWorker.prototype.process = function(slackData, cb) {
    var self = this;

    console.log('searching for Slack user: ', slackData.user_id);

    User.findOne({
        'slack.id': slackData.user_id
    }, function(err, user) {
        if (err) {
            console.log(err);
            cb(null, {
                msg: 'An error occured for that Slack user(' + slackData.user_id + '): ' +
                    err
            });
        } else {
            console.log(user);

            if (user && user.sfdc) {
                console.log('processing SFDC command for ', user);
                if (slackData.command == '/chatter') {
                    self.chatter(user, slackData, cb);
                } else if (slackData.command == '/timecard') {
                    self.timecard(user, slackData, cb);
                } else if (slackData.command == '/case') {
                    self.case(user, slackData, cb);
                } else if (slackData.command == '/soql') {
                    self.soql(user, slackData, cb);
                } else { //CWD-- just look for user identity
                    self.identity(user, slackData, cb);
                }
            } else {
                console.log('no SFDC user found for that slack user: ', slackData.user_id);
                cb(null, {
                    channel_id: slackData.user_id,
                    msg: 'No SFDC oAuth for that slack user(' + slackData.user_id +
                        '). please auth. ' + config.APPURL + '/sfdc/oauth'
                });
            }
        }
    });
}


module.exports = SFDCWorker;
