var Promise = require('nano-promise'),
    newStopper = require('./stopper.js'),
    newJob = require('./job.js');

function newSched(name, opts, mill) {
	var jobs_count = 0,
	    jobs = {},
	    jid_top = 1;


	function cancel() {
		for (var id in jobs)
			jobs[id].cancel();
	}

	var resolve, reject,
	    sched = new Promise(function (res, rej) {
		resolve = res;
		reject = rej;
		return { cancel: cancel };
	});

	sched.name = name;
	sched.opts = opts;

	var stoppers = {};
	sched.stopper = function (id) {
		var s = stoppers[id];
		if (s)
			return s;
		s = stoppers[id] = newStopper(id);
		s.then(function () {
			mill.signal(id);
		}, function (err) {
		});
		return s;
	};

	sched.plugins = {};
	/* istanbul ignore else */
	if (opts.plugins)
		for (var id in opts.plugins)
			sched.plugins[id] = opts.plugins[id];

	sched.process = function (id, log, data) {
		var pid = id.join('.');
		return this.plugins[id](log, data);
	};
	sched.job = function (name, data) {
		var jid = jid_top++,
		    j = jobs[jid] = newJob(name, data, this);

		++jobs_count;

		j.then(function () {
			delete jobs[jid];
			if (!--jobs_count);
				resolve();
		}, function (err) {
			reject(err);
			cancel();
			throw err;
		});
		return j;
	};

	return sched;
}

module.exports = newSched;