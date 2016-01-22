'use strict';

var config = require('config');
var _ = require('lodash');
var express = require('express');
var router = express.Router();
var kue = require('kue');
var queue = kue.createQueue({
	redis: config.REDIS_URL
});


router.get('/:state?/:n?', function(req, res) {
	var n = req.params.n || 100;
	var state = req.params.state || 'active'

	kue.Job.rangeByState(state, 0, n, 'asc', function(err, jobs) {
		res.json(jobs);
	});

});

router.get('/clear/:state/:n', function(req, res) { //CWD-- should really be a delete maybe?
	kue.Job.rangeByState(req.params.state, 0, req.params.n, 'asc', function(err, jobs) {
		_.forEach(jobs, function(job) {
			job.remove(function() {
				console.log('removed ', job.id);
			});
		});

		res.json(jobs);
	});

});

module.exports = router;
