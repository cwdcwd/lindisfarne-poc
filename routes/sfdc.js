'use strict';

var config = require('config');
var _ = require('lodash');
var User = require('../model/User.js');

var express = require('express');
var router = express.Router();

var nforce = require('nforce');
var org = nforce.createConnection({
	clientId: config.SFDC_KEY,
	clientSecret: config.SFDC_SECRET,
	redirectUri: 'http://localhost:3000/sfdc/oauth_callback',
	apiVersion: 'v35.0', // optional, defaults to current salesforce API version
	environment: 'production', // optional, salesforce 'sandbox' or 'production', production default
	mode: 'multi', // optional, 'single' or 'multi' user mode, multi default
	autoRefresh: true,
	onRefresh: function(newOauth, oldOauth, cb) {
		console.log(newOauth, oldOauth);
		cb();
	}
});

router.get('/oauth', function(req, res) {
	if (!req.session.userId) {
		req.session.landingPage = '/sfdc/oauth';
		res.redirect('/slack/oauth');
	} else {
		req.session.landingPage = null;
		res.redirect(org.getAuthUri());
	}
});

router.get('/oauth_callback', function(req, res) {
	console.log('callback for user: ', req.session.userId)
	org.authenticate({
		code: req.query.code
	}, function(err, resp) {
		if (!err) {
			console.log(resp);
			console.log('Access Token: ' + resp.access_token);
			console.log('saving for user: ', req.session.userId)
				//save SFDC details to user here
			User.findOneAndUpdate({
					_id: req.session.userId
				}, {
					//'sfdc.accessToken': resp.access_token
					sfdc: resp
				},
				function(err, doc) {
					if (err) {
						console.log('Error: ' + err.message);
						res.redirect('/fail');
					} else {
						console.log(doc);
						res.redirect('/whoami');
					}
				});

			//res.json(resp.access_token);

		} else {
			console.log('Error: ' + err.message);
			res.redirect('/fail');
		}
	});
});

router.get('/identity', function(req, res) {
	if (!req.session.userId) {
		res.redirect('/slack/oauth');
	} else {
		User.findOne({
			_id: req.session.userId
		}, function(err, user) {
			if (err) {
				res.redirect('/sfdc/oauth');
			} else {
				org.getIdentity({
					oauth: user.sfdc
				}, function(err, sfdcRes) {
					if (err) {
						res.status(500).json(err);
					} else {
						console.log(res);
						res.json(sfdcRes);
					}
				});
			}
		});
	}
});

module.exports = router;
