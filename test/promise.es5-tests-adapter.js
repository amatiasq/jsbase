//jshint globalstrict:true

'use strict';

var Promise = require('../src/promise.es5');

exports.fulfilled = Promise.resolved;
exports.rejected = Promise.rejected;

exports.pending = function () {
	var deferred = new Promise();

	return {
		promise: deferred.future,
		fulfill: deferred.resolve.bind(deferred),
		reject: deferred.reject.bind(deferred)
	};
};
