'use strict';

var config = {};

config.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
config.SLACKBOT_TOKEN = process.env.SLACKBOT_TOKEN || 'xoxb-15362946003-XpexNctM29rY4bDkFXzgI2Vp';

module.exports = config;
