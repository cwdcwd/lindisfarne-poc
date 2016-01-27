'use strict';

var config = {};

config.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
config.SLACKBOT_TOKEN = process.env.SLACKBOT_TOKEN || '';
config.PHOTON_USERNAME = process.env.PHOTON_USERNAME || '';
config.PHOTON_PASSWORD = process.env.PHOTON_PASSWORD || '';
config.PHOTON_DEVICEID = process.env.PHOTON_DEVICEID || '';
config.WHITELIST = process.env.WHITELIST || [];
config.SFDC_USER = process.env.SFDC_USER || '';
config.SFDC_PASS = process.env.SFDC_PASS || '';
config.SFDC_TOKEN = process.env.SFDC_TOKEN || '';

config.SFDC_KEY = process.env.SFDC_KEY || '';
config.SFDC_SECRET = process.env.SFDC_SECRET || '';
config.SLACK_KEY = process.env.SLACK_KEY || '';
config.SLACK_SECRET = process.env.SLACK_SECRET || '';

config.db = (process.env.MONGOLAB_URI || ('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') +
    '/lindisfarne'));


module.exports = config;
