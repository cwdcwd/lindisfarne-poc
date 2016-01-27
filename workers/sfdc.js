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
        mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
    });
}

SFDCWorker.prototype.connect = function(user) {
    console.log('connecting as ' + user);
    this.org.authenticate({
        user.sfdc.accessToken
            //username: config.SFDC_USER,
            //password: config.SFDC_PASS,
            //        securityToken: config.SFDC_TOKEN
    }, function(err, resp) {
        if (!err) {
            console.log('Access Token: ' + resp.access_token);
            oauth = resp;
        } else {
            console.log('Error: ' + err.message);
        }
    });
}

module.exports = SFDCWorker;
