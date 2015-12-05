'use strict';

var config = require('config');
var Spark = require('spark');

var interpretState = function(iState) {
    return (iState === 1) ? 'open' : ((iState === -1) ? 'closed' : 'unknown');
}

var GarageBaerWorker = function(username, password, deviceId, whitelist) {
    this.deviceId = deviceId;
    this.spark = Spark;
    this.spark.login({
        username: username,
        password: password
    }, function(err, body) {
        console.log('API call login completed on callback:', err, body);
    });

    this.whitelist = whitelist || [];
}

GarageBaerWorker.prototype.process = function(slackData, cb) {
    var self = this;
    if(_.find(slackData.user_name.toUpperCase()),function(s){
        
    }

    if (slackData.text === 'state') {
        self.spark.getVariable(self.deviceId, 'state', function(err, data) {
            console.log(err, data);
            if (err) {

            } else {
                data = 'State is currently: ' + interpretState(data.result);
            }

            cb(err, data);
        });
    } else if ((slackData.text === 'open') || (slackData.text === 'close')) {
        var funcName = (slackData.text === 'open') ? 'openDoor' : 'closeDoor';

        self.spark.callFunction(self.deviceId, funcName, null, function(err, data) {
            console.log(data);
            if (err) {

            } else {
                data = 'Ok I did just that. The Door State is currently: ' + interpretState(data.return_value);
            }

            cb(err, data);
        });
    } else {
        cb('I really am not sure what you are on about');
    }

}

module.exports = GarageBaerWorker;
