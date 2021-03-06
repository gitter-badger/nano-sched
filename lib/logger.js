"use strict";

var fs = require('nano-fs'),
    Path = require('path'),
    util = require('util');

/* ------------------------------------------------------------------------ */
function Logger(stage, job) {

	var opts = job.sched.opts,
	    dumps_folder = opts.dumps_folder || './.logs/',
	    console = opts.console || /* istanbul ignore next */ global.console,
	    quiet = opts.quiet || {};

	var context = job.sched.name + ':' + job.name + '#' + stage;

	this.stage = stage;
	this.job = job;

	this.log = function (code, format, a, b, etc) {
		/* istanbul ignore else */
		if (!(code in quiet))
			console.log('%s: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1)));
	};

	this.trace = function () {
		this.log.apply(this, Array.prototype.concat.apply(['trace'], arguments));
	};

	this.warn = function (code, format, a, b, etc) {
		/* istanbul ignore else */
		if (!(code in quiet))
			console.warn('%s: warning: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1)));
	};

	this.error = function (format, a, b, etc) {
		console.error('%s: error: %s', context, util.format.apply(util.format, Array.prototype.slice.call(arguments, 1)));
	};

	this.fail = function (format, a, b, etc) {
		console.log('%s: FAIL: %s', context, util.format.apply(util.format, arguments));
	};

	this.writeListing = function (name, data) {
		var json = require('nano-json'),
		    text = typeof data === 'object' ? json.render(data, { }) : json.js2str(data),
		    self = this;

		return fs.mkpath(dumps_folder).then(function () {
			return fs.writeFile(Path.join(dumps_folder, context+'.dump.json'), text, { encoding: 'utf8' });
		});
	};
}

Logger.prototype = {
};


module.exports = Logger;
