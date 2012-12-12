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
			var promiseMethod = config.promise;
			var futureMethod = config.future;

			it('should call the callback passed to .' + futureMethod +
				'() method when .' + promiseMethod + '() is called', function() {

				var scope = {};
				var arg1 = {};
				var arg2 = [];
				var spy = sinon.spy();

				future[futureMethod](spy, scope);
				expect(spy.called).toBeFalse();
				promise[promiseMethod](arg1, arg2);

				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledOn(scope)).toBeTrue();
				expect(spy.calledWithExactly(arg1, arg2)).toBeTrue();
			});
		});

		shouldNotCall.forEach(function(config) {
			var promiseMethod = config.promise;
			var futureMethod = config.future;

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
			var promiseMethod = config.promise;
			var futureMethod = config.future;

			it('should call the callback passed to .' + futureMethod +
				'() method when .' + promiseMethod + '() is called', function() {

				var scope = {};
				var arg1 = {};
				var arg2 = [];
				var spy = sinon.spy();
				var clock = sinon.useFakeTimers();

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
			var promiseMethod = config.promise;
			var futureMethod = config.future;

			it('should not call .' + futureMethod +
				'() listeners if .' + promiseMethod + '() is called', function() {

				var spy = sinon.spy();
				var clock = sinon.useFakeTimers();

				future[futureMethod](spy);
				promise[promiseMethod]();

				clock.tick(20);
				expect(spy.called).toBeFalse();
				clock.restore();
			});
		});
	});

	describe('Static methods', function() {
		describe('#done method', function() {
			it('should return a fulfilled future', function() {
				var sut = Promise.done()
				expect(sut).toBeInstanceOf(Promise.Future);
				expect(sut.hasSucceed()).toBeTrue();
			});
		});

		describe('#failed method', function() {
			it('should return a failed future', function() {
				var sut = Promise.failed()
				expect(sut).toBeInstanceOf(Promise.Future);
				expect(sut.hasFailed()).toBeTrue();
			});
		});

		describe('#parallel method', function() {
			it('should return a done promise if empty array or no arg is passed', function() {
				expect(Promise.parallel().hasSucceed()).toBeTrue();
				expect(Promise.parallel([]).hasSucceed()).toBeTrue();
			});

			it('should return a promise to be fulfilled when every passed promise has succeed', function() {
				var clock = sinon.useFakeTimers();
				var sample1 = new Promise();
				var sample2 = new Promise();

				var promiseSut = Promise.parallel(sample1, sample2);
				var futureSut = Promise.parallel(sample1.getFuture(), sample2.getFuture());

				sample1.done();
				sample2.done();
				clock.tick(20);

				expect(promiseSut.hasSucceed()).toBeTrue();
				expect(futureSut.hasSucceed()).toBeTrue();
				clock.restore();
			});

			it('should pass the promises results as array arguments', function() {
				var clock = sinon.useFakeTimers();
				var sample1 = new Promise();
				var sample2 = new Promise();
				var sut = Promise.parallel(sample1, sample2);
				var param11 = 'hola';
				var param12 = 'mundo';
				var param21 = 'cosa';

				sample1.done(param11, param12);
				sample2.done(param21);
				clock.tick(20);

				var args;
				sut.then(function() { args = arguments });
				clock.tick(20);

				expect(args[0][0]).toBe(param11);
				expect(args[0][1]).toBe(param12);
				expect(args[1][0]).toBe(param21);
				clock.restore();
			});

			describe('#flatResults instance method', function() {
				it('should modify the recived arguments so only the first argument of each promise is passed to the final promise', function() {
					var clock = sinon.useFakeTimers();
					var sample1 = new Promise();
					var sample2 = new Promise();
					var sut = Promise.parallel(sample1, sample2).flatResults();
					var param1 = 'hola';
					var param2 = 'cosa';

					sample1.done(param1);
					sample2.done(param2);
					clock.tick(20);

					var args;
					sut.then(function() { args = arguments });
					clock.tick(20);

					expect(args[0]).toBe(param1);
					expect(args[1]).toBe(param2);
					clock.restore();
				});
			});
		});
	});
});
