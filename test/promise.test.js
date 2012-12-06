if (typeof module !== 'undefined' && module.exports === exports) {
	var sinon = require('sinon');
	var expect = require('../lib/expect');
	var Promise = require('../src' + (process.env['CODE_COVERAGE'] ? '-cov' : '') + '/promise');
}

describe('Promise class', function() {

	var promise, future;
	beforeEach(function() {
		promise = new Promise();
		future = promise.getFuture();
	});


	var shouldCall = [{
		promise: 'done',
		future: 'onDone'
	}, {
		promise: 'fail',
		future: 'onError'
	}, {
		promise: 'done',
		future: 'onFinally'
	}, {
		promise: 'fail',
		future: 'onFinally'
	}];

	var shouldNotCall = [{
		promise: 'done',
		future: 'onError'
	}, {
		promise: 'fail',
		future: 'onDone'
	}];


	describe('Adding listeners before the promise is complete...', function() {

		shouldCall.forEach(function(config) {
			var promiseMethod = config.promise,
				futureMethod = config.future;

			it('should call the callback passed to .' + futureMethod +
				'() method when .' + promiseMethod + '() is called', function() {

				var scope = {},
					arg1 = {},
					arg2 = [],
					spy = sinon.spy();

				future[futureMethod](spy, scope);
				expect(spy.called).toBeFalse();
				promise[promiseMethod](arg1, arg2);

				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledOn(scope)).toBeTrue();
				expect(spy.calledWithExactly(arg1, arg2)).toBeTrue();
			});
		});

		shouldNotCall.forEach(function(config) {
			var promiseMethod = config.promise,
				futureMethod = config.future;

			it('should not call .' + futureMethod +
				'() listeners if .' + promiseMethod + '() is called', function() {

				var spy = sinon.spy();
				future[futureMethod](spy);
				promise[promiseMethod]();
				expect(spy.called).toBeFalse();
			});
		});
	});


	describe('Adding listeners after the promise is complete...', function() {

		shouldCall.forEach(function(config) {
			var promiseMethod = config.promise,
				futureMethod = config.future;

			it('should call the callback passed to .' + futureMethod +
				'() method when .' + promiseMethod + '() is called', function() {

				var scope = {},
					arg1 = {},
					arg2 = [],
					spy = sinon.spy(),
					clock = sinon.useFakeTimers();

				promise[promiseMethod](arg1, arg2);
				future[futureMethod](spy, scope);

				expect(spy.called).toBeFalse();
				clock.tick(20);

				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledOn(scope)).toBeTrue();
				expect(spy.calledWithExactly(arg1, arg2)).toBeTrue();

				clock.restore();
			});
		});

		shouldNotCall.forEach(function(config) {
			var promiseMethod = config.promise,
				futureMethod = config.future;

			it('should not call .' + futureMethod +
				'() listeners if .' + promiseMethod + '() is called', function() {

				var spy = sinon.spy(),
					clock = sinon.useFakeTimers();

				future[futureMethod](spy);
				promise[promiseMethod]();

				clock.tick(20);
				expect(spy.called).toBeFalse();
				clock.restore();
			});
		});
	});
});
