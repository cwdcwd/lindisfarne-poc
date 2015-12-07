'use strict';

var config = {};

config.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
config.SLACKBOT_TOKEN = process.env.SLACKBOT_TOKEN || '';
config.PHOTON_USERNAME = process.env.PHOTON_USERNAME || '';
config.PHOTON_PASSWORD = process.env.PHOTON_PASSWORD || '';
config.PHOTON_DEVICEID = process.env.PHOTON_DEVICEID || '';
config.WHITELIST = process.env.WHITELIST || [];

module.exports = config;
