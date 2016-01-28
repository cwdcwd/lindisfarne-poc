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
    }, cb);
}

SFDCWorker.prototype.soql = function(user, slackData, cb) {
    var self = this;

    console.log('query with ' + slackData.text);
    self.org.query({
        oauth: user.sfdc,
        query: slackData.text
    }, cb);
}

SFDCWorker.prototype.case = function(user, slackData, cb) {
    var self = this;
    var caseObj = nforce.createSObject('Case');
    caseObj.set('Description', slackData.text);

    console.log('creating  case with ' + slackData.text);
    org.insert({
        sobject: caseObj,
        oauth: oauth
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
            cb(null,
                'Cannot find a SFDC User for that Slack user(' + slackData.user_id + '): ' +
                err);
        } else {
            console.log('processing SFDC command for ', user);
            if (user.sfdc) {

                if (slackData.command == '/chatter') {
                    self.chatter(user, slackData, cb);
                } else if (slackData.command == '/case') {
                    self.case(user, slackData, cb);
                } else if (slackData.command == '/soql') {
                    self.soql(user, slackData, cb);
                } else { //CWD-- just look for user identity
                    self.identity(user, slackData, cb);
                }
            } else {
                cb(null,
                    'No SFDC oAuth for that slack user(' + slackData.user_id +
                    '). please auth. [insert auth URL here]');
            }
        }
    });
}


module.exports = SFDCWorker;
