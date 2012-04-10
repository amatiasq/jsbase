/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {

	var slice = Array.prototype.slice;

	if (typeof window === 'undefined')
		module.exports = Promise;
	else
		this.Promise = Promise;

	if (typeof Class === 'function' && typeof Class.extend === 'function')
		Promise.extend = Class.extend;

	function Promise() {
		this._oncomplete = [];
		this._onerror = [];
		this._onprogress = [];
		this._state = 'unfulfilled';
		this._args = null;
	}

	Promise.completed = function() {
		var prom = new Promise();
		prom.complete.apply(prom, arguments);
		return prom;
	};
	Promise.failed = function() {
		var prom = new Promise();
		prom.fail.apply(prom, arguments);
		return prom;
	};
	Promise.parallel = function(promises) {
		var promise = new Promise();
		var result = [];
		var completed = [];

		if (arguments.length > 1)
			promises = slice.call(arguments);

		var len = completed.length = promises.length;
		if (len === 0)
			return Promise.completed();

		for (var i = 0; i < len; i++)
			queueParallel(promise, promises[i], i, completed, results);

		return promise;
	};
	Promise.serial = function(callbacks) {
		var promise = new Promise();
		if (arguments.length > 1)
			callbacks = slice.call(arguments);

		if (callbacks.length === 0)
			return Promise.completed();

		nextSequential(promise, callbacks, 0, [])
		return promise;
	};

	function queueParallel(prom, target, index, completed, results) {
		target.then(function() {

			completed[index] = true;
			results[index] = slice.call(arguments);

			if (!prom.isOpen())
				return;

			for (var i = completed.length; i--; )
				if (!completed[i])
					return;

			prom.complete.apply(prom, results);

		}, function() {
			if (prom.isOpen())
				prom.fail.apply(prom, arguments);
		});
	}
	function nextSequential(prom, callbacks, index, args) {
		if (index === callbacks.length)
			return prom.complete.apply(prom, args);

		var result = callbacks[index].apply(null, args);

		if (!(result instanceof Promise)) {
			nextSecuencial(prom, callbacks, index + 1, [result]);
		} else {
			result.then(function() {
				nextSecuencial(prom, callbacks, index + 1, arguments);
			}, function(args) {
				prom.fail.apply(prom, arguments);
			});
		}
	}

	Promise.prototype = {
		constructor: Promise,

		complete: function(var_args) {
			if (checkValid(this._state)) {
				this._state = 'fulfilled';
				this._args = slice.call(arguments);
				call(this._oncomplete, this._args);
			}
		},

		fail: function(var_args) {
			if (checkValid(this._state)) {
				this._state = 'failed';
				if (this._onerror.length === 0)
					throw new Error('Promise failed without handler.');
				this._args = slice.call(arguments);
				call(this._onerror, this._args);
			}
		},

		progress: function(var_args) {
			if (this.isCanceled())
				return;

			for (var i = 0, len = this._onprogress.length; i < len; i++)
				this._onprogress[i].apply(null, arguments);
		},

		onComplete: function(callback) {
			if (typeof callback !== 'function')
				return;

			if (this.isCompleted())
				call(callback, this._args);
			else
				this._oncomplete.push(callback);
		},

		onFail: function(callback) {
			if (typeof callback !== 'function')
				return;

			if (this.isFailed())
				call(callback, this._args);
			else
				this._onerror.push(callback);
		},

		onProgress: function(callback) {
			if (typeof callback !== 'function')
				return;

			this._onprogress.push(callback);
		},

		then: function(success, fail, progress) {
			this.onComplete(success);
			this.onFail(fail);
			this.onProgress(progress);
		},

		cancel: function() {
			this._state = 'canceled';
		},

		isCanceled: function() {
			return this._state === 'canceled';
		},

		isCompleted: function() {
			return this._state === 'fulfilled';
		},

		isFailed: function() {
			return this._state === 'failed';
		},

		isOpen: function() {
			return this._state === 'unfulfilled';
		}

	};

	function call(callbacks, args) {
		setTimeout(function() {
			if (typeof callbacks === 'function')
				return callbacks.apply(null, args);

			for (var i = 0, len = callbacks.length; i < len; i++)
				callbacks[i].apply(null, args);
		}, 0);
	}

	function checkValid(state) {
		switch (state) {
			case 'unfulfilled':
				return true;
			case 'canceled':
				return false;
			case 'fulfilled':
				throw new Error('Promise is completed')
			case 'failed':
				throw new Error('Promise is failed');
			default:
				throw new Error('Invalid promise state ' + state);
		}
	}

})();