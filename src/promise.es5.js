(function(factory) {
	'use strict';

	if (typeof define !== 'undefined' && define.amd)
		define(factory);
	else if (typeof module !== 'undefined' && module.exports)
		module.exports = factory();
	else
		window.Promise = factory();

})(function() {
	'use strict';

	//
	// HELPERS
	//

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
	function invoke(fn) {
		return fn();
	}

	function extend(target) {
		slice.call(arguments, 1).forEach(function(source) {
			Object.keys(source).forEach(function(key) {
				var descriptor = Object.getOwnPropertyDescriptor(source, key);
				Object.defineProperty(target, key, descriptor);
			});
		});
		return target;
	}

	var setImmediate = window.setImmediate || function(fn) { setTimeout(fn, 0) };


	//
	// STATICS
	//

	function resolved(value) {
		var prom = new Promise();
		prom.resolve(value);
		return prom.future;
	}

	function rejected(error) {
		var prom = new Promise();
		prom.reject(error);
		return prom.future;
	}

	function normalize(value) {
		if (value instanceof Promise)
			value = value.future;

		return value instanceof Future ? value : resolved(value);
	}

	function callbackWrapper(object, method) {
		return function() {
			var prom = new Promise();
			object[method].apply(object, slice.call(arguments).concat(prom.callback(method)));
			return prom.future;
		};
	}

	function adapter(obj, methods) {
		methods = methods || Object.keys(obj);
		var adapter = Object.create(obj);
		methods.forEach(function(method) {
			adapter[method] = callbackWrapper(obj, method);
		});
		return adapter;
	}

	function all(futures) {
		if (!(futures instanceof Array))
			futures = slice.call(arguments);

		if (!futures.length)
			return resolved([]);

		var promise = new Promise();
		futures = futures.map(normalize);
		futures.forEach(funct('then', function() {
			if (futures.every(funct('isResolved')))
				promise.resolve(futures.map(prop('value')));
		}, promise.reject.bind(promise)));

		return promise.future;
	}


	//
	// PROMISE
	//

	function Promise() {
		Object.defineProperty(this, 'future', { get: returner(new Future()) });
	}

	extend(Promise, {
		resolved: resolved,
		rejected: rejected,
		normalize: normalize,
		adapter: adapter,
		all: all,
	});

	extend(Promise.prototype, {
		resolve: function(value) {
			if (this.future.state !== 'unfulfilled') return;

			if (value instanceof Future)
				return value.then(this.resolve.bind(this), this.reject.bind(this));

			this.future.value = value;
			this.future.state = 'fulfilled';
			this.future._cbk.forEach(invoke);
		},

		reject: function(error) {
			if (this.future.state !== 'unfulfilled') return;

			this.future.error = error;
			this.future.state = 'failed';
			this.future._cbk.forEach(invoke);
		},

		callback: function(name) {
			var self = this;
			return function(err, result) {
				console.log('Automatic callback invoked', name, err, result && result.toString());
				if (err) self.reject(err);
				else self.resolve(result);
			};
		}
	});


	//
	// FUTURES
	//

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

	extend(Future.prototype, {
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
				setImmediate(wrapper);

			return promise.future;
		},

		fin: function(handler) {
			return this.then(function(value) {
				return normalize(handler()).then(returner(value));
			}, function(error) {
				return normalize(handler()).then(returner(rejected(error)) });
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

		method: function(method, args) {
			return this.then(function(value) { return value[method].apply(value, args); });
		},

		invoke: function(/* var_args */) {
			var args = slice.call(arguments);
			return this.then(function(value) { return value.apply(null, args) });
		},

		adapt: function(methods) {
			this.then(function(value) {
				return Promise.adapt(value, methods);
			});
		}
	};

	return Promise;

});
