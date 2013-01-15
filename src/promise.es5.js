/*

interface Promise {
	void resolve(Object value);
	void reject(Error err);

	static Future normalize(Promise|Object value); alias when
	static Future resolved(Object value);
	static Future rejected(Error err);

	static Future all(Array<Future|Promise> promises); alias parallel
	static Future all(Future|Promise var_args...); alias parallel
*	static Future wrap(fn, scope, args);
}

interface Future {
	Object value;
	Error error;

	bool isResolved();
	bool isRejected();
	bool isCompleted();

	Future then(Function resolved, Function rejected);
	Future fin(Function finally);

	Future timeout(Number ms);
	Future spread();

	Future prop(String property);
	Future put(String property, Object value);
	Future method(String name, Object params...);
	Future invoke(String name, Array params);
	Future execute(Object params...);
}

*/

;(function(factory) {

	if (typeof define !== 'undefined' && define.amd)
		define(factory);
	else if (typeof module !== 'undefined' && module.exports)
		module.exports = factory();
	else
		window.Promise = factory();

})(function() {
	"use strict";

	var slice = Array.prototype.slice;

	function returner(value) {
		return function() {
			return value;
		};
	}
	function funct(name) {
		var args = slice.call(arguments, 1);
		return function(item) {
			return item[name].apply(item, args.concat(arguments));
		};
	}
	function prop(name) {
		return function(item) {
			return item[name];
		};
	}

	function Promise() {
		Object.defineProperty(this, 'future', { get: returner(new Future()) });
	}

	Promise.prototype = {
		constructor: Promise,

		resolve: function(value) {
			if (this.future.state !== 'unfulfilled') return;

			if (value instanceof Future)
				return value.then(this.resolve.bind(this), this.reject.bind(this));

			this.future.value = value;
			this.future.state = 'fulfilled';
			this.future._cbk.forEach(function(callback) {
				callback();
			});
		},

		reject: function(error) {
			if (this.future.state !== 'unfulfilled') return;

			this.future.error = error;
			this.future.state = 'failed';
			this.future._cbk.forEach(function(callback) {
				callback();
			});
		}
	};

	Promise.resolved = function(value) {
		var prom = new Promise();
		prom.resolve(value);
		return prom.future;
	};

	Promise.rejected = function(error) {
		var prom = new Promise();
		prom.reject(error);
		return prom.future;
	};

	Promise.normalize = Promise.when = function(value) {
		if (value instanceof Promise)
			value = value.future;

		return value instanceof Future ? value : Promise.resolved(value);
	};

	Promise.all = Promise.parallel = function(futures) {
		if (!(futures instanceof Array))
			futures = slice.call(arguments);

		if (!futures.length)
			return Promise.resolved([]);

		var promise = new Promise();
		futures = futures.map(Promise.normalize);
		futures.forEach(funct('then', function() {
			if (futures.every(funct('isResolved')))
				promise.resolve(futures.map(prop('value')));
		}, promise.reject.bind(promise)));

		return promise.future;
	};


	function Future() {
		this.state = 'unfulfilled';
		Object.defineProperty(this, '_cbk', { get: returner([]) });
	}

	function invokeCallback(callback, value, promise, promiseMethod) {
		if (typeof callback !== 'function')
			return promise[promiseMethod](value);

		if (Promise.debug)
			return promise.resolve(callback(value));

		try {
			promise.resolve(callback(value));
		} catch(err) {
			promise.reject(err);
		}
	}

	Future.prototype = {
		constructor: Future,

		isResolved: function() {
			return this.state === 'fulfilled';
		},

		isRejected: function() {
			return this.state === 'failed';
		},

		isCompleted: function() {
			return this.state !== 'unfulfilled';
		},

		then: function(resolved, rejected) {
			var self = this;
			var promise = new Promise();

			function wrapper() {
				if (self.state === 'fulfilled')
					invokeCallback(resolved, self.value, promise, 'resolve');
				else
					invokeCallback(rejected, self.error, promise, 'reject');
			}

			if (this.state === 'unfulfilled')
				this._cbk.push(wrapper);
			else
				setTimeout(wrapper, 0);

			return promise.future;
		},

		fin: function(handler) {
			return this.then(function(value) {
				return Promise.normalize(handler()).then(returner(value));
			}, function(error) {
				return Promise.normalize(handler()).then(function() { return Promise.rejected(error) });
			});
		},

		spread: function(resolved, rejected) {
			if (typeof resolved !== 'function')
				return this.then(null, rejected);

			return this.then(function(array) {
				return resolved.apply(null, array);
			}, rejected);
		},

		timeout: function(milliseconds) {
			var promise = new Promise();
			setTimeout(promise.reject.bind(promise, new Error('timeout')), milliseconds);
			return promise.future;
		},

		flat: function() {
			return this.then(function(value) { return [].concat.apply([], value) });
		},

		prop: function(prop) {
			return this.then(function(value) { return value[prop] });
		},

		set: function(prop, value) {
			return this.then(function(obj) { obj[prop] = value; return obj });
		},

		method: function(method/*, var_args*/) {
			return this.invoke(method, slice.call(arguments, 1));
		},

		invoke: function(method, args) {
			return this.then(function(value) { return value[method].apply(value, args); });
		},

		execute: function(/* var_args */) {
			var args = slice.call(arguments);
			return this.then(function(value) { return value.apply(null, args) });
		}
	};

	return Promise;

});
