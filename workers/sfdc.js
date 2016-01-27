var _ = require('lodash');
var config = require('config');
var nforce = require('nforce');


var SFDCWorker = function() {

    this.org = nforce.createConnection({
        clientId: config.SFDC_KEY,
        clientSecret: config.SFDC_PASS
        redirectUri: 'http://localhost:3000/sfdc/oauth_callback',
        apiVersion: 'v35.0', // optional, defaults to current salesforce API version
        environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
        mode: 'single', // optional, 'single' or 'multi' user mode, multi default
        autoRefresh: true
    });
}

SFDCWorker.prototype.connect = function(user, cb) {
    console.log('connecting as ' + user);
    this.org.authenticate({
        user.sfdc.accessToken
            //username: config.SFDC_USER,
            //password: config.SFDC_PASS,
            //        securityToken: config.SFDC_TOKEN
    }, function(err, oauth) {
        if (!err) {
            console.log('Access Token: ' + oauth.access_token);
        } else {
            console.log('Error: ' + err.message);
        }

        cb(err, oauth);
    });
}

SFDCWorker.prototype.process = function(oauth, slackData, cb) {
    this.org.getIdentity({
        oauth: oauth
    }, function(err, res) {
        if (err) throw err;
        console.log(res);
        cb('')
    });
}


module.exports = SFDCWorker;
