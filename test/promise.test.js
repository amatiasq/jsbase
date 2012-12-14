if (typeof module !== 'undefined' && module.exports === exports) {
	var sinon = require('sinon');
	var expect = require('../lib/expect');
	var Promise = require('../src' + (process.env['CODE_COVERAGE'] ? '-cov' : '') + '/promise');
}

describe('Promise module', function() {

	describe('Promise type', function() {
		describe('#resolve method', function() {

			var spy, sut;
			beforeEach(function() {
				spy = sinon.spy();
				sut = new Promise();
				sut.future.then(spy);
			});

			it('should do nothing if the promise is already completed', function() {
				sut.reject();
				sut.resolve();
				expect(sut.future.state).toBe('failed');
			});
			it('should change the future state to "fulfilled"', function() {
				sut.resolve();
				expect(sut.future.state).toBe('fulfilled');
			});

			it('should call the first arguments passed to each #then call', function() {
				expect(spy.called).toBeFalse();
				sut.resolve();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should pass its argument to the callbacks', function() {
				sut.resolve('hola');
				expect(spy.calledWithExactly('hola')).toBeTrue();
			});

			it('should call asynchronously the callbacks added after resolve method', function() {
				var clock = sinon.useFakeTimers();
				var otherSpy = sinon.spy();
				sut.resolve('hola');

				sut.future.then(otherSpy);
				expect(otherSpy.called).toBeFalse();

				clock.tick(20);
				expect(otherSpy.calledOnce).toBeTrue();
				expect(otherSpy.calledWithExactly('hola')).toBeTrue();
				clock.restore();
			});

			it('should wait for it to complete if the recived value is a future', function() {
				var clock = sinon.useFakeTimers();
				var otherPromise = new Promise();
				sut.resolve(otherPromise.future);
				expect(spy.called).toBeFalse();

				otherPromise.resolve('hola');
				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledWithExactly('hola')).toBeTrue();
			});
		});

		describe('#reject method', function() {

			var spy, sut;
			beforeEach(function() {
				spy = sinon.spy();
				sut = new Promise();
				sut.future.then(null, spy);
			});

			it('should do nothing if the promise is already completed', function() {
				sut.resolve();
				sut.reject();
				expect(sut.future.state).toBe('fulfilled');
			});
			it('should change the future state to "failed"', function() {
				sut.reject();
				expect(sut.future.state).toBe('failed');
			});

			it('should call the first arguments passed to each #then call', function() {
				expect(spy.called).toBeFalse();
				sut.reject();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should pass its argument to the callbacks', function() {
				sut.reject('hola');
				expect(spy.calledWithExactly('hola')).toBeTrue();
			});

			it('should call asynchronously the callbacks added after reject method', function() {
				var clock = sinon.useFakeTimers();
				var otherSpy = sinon.spy();
				sut.reject('hola');

				sut.future.then(null, otherSpy);
				expect(otherSpy.called).toBeFalse();

				clock.tick(20);
				expect(otherSpy.calledOnce).toBeTrue();
				expect(otherSpy.calledWithExactly('hola')).toBeTrue();
				clock.restore();
			});
		});
	});

	describe('Static Promise methods', function() {
		it('#resolved method should return a promise resolved with the passed value', function() {
			var sut = Promise.resolved('hola');
			expect(sut.isResolved()).toBeTrue();
			expect(sut.value).toBe('hola');
		});
		it('#rejected method should return a promise rejected with the passed error', function() {
			var sut = Promise.rejected('hola');
			expect(sut.isRejected()).toBeTrue();
			expect(sut.error).toBe('hola');
		});

		describe('#normalize method', function() {
			it('should return a future fulfilled with the argument if it\'s not a future or a promise', function() {
				expect(Promise.normalize('hola').value).toBe('hola');
			});
			it('should return a future if the argument is a future and bind them', function() {
				var clock = sinon.useFakeTimers();
				var success = Promise.normalize(Promise.resolved('hola'));
				var failed = Promise.normalize(Promise.rejected('mundo'));

				clock.tick(20);
				expect(success.value).toBe('hola');
				expect(failed.error).toBe('mundo');
				clock.restore();
			});
		});

		describe('#all method', function() {
			it('should return a resolved promise if no future is passed', function() {
				expect(Promise.all().isResolved()).toBeTrue();
			});

			it('should return a future to be resoved when every passed future is resolved', function() {
				var prom1 = new Promise();
				var prom2 = new Promise();
				var sut = Promise.all(prom1.future, prom2.future);

				prom1.resolve();
				expect(sut.isResolved()).toBeFalse();
				prom2.resolve();
				expect(sut.isResolved()).toBeTrue();
			});

			it('should pass a array with the values returned by the futures', function() {
				var clock = sinon.useFakeTimers();
				var spy = sinon.spy();
				Promise.all(Promise.resolved('hola'), Promise.resolved('mundo')).then(spy);

				clock.tick(20);
				expect(spy.calledWith([ 'hola', 'mundo' ])).toBeTrue();
				clock.restore();
			});

			it('should reject the promise if any future is rejected', function() {
				var clock = sinon.useFakeTimers();
				var sut = Promise.all(Promise.resolved(), Promise.rejected());

				clock.tick(20);
				expect(sut.isRejected()).toBeTrue();
				clock.restore();
			})
		});
	});

	describe("Future type", function() {
		describe('#then method returned future', function() {
			var spy, promise;
			beforeEach(function() {
				spy = sinon.spy();
				promise = new Promise();
			});

			it('should be fulfilled after the first future is fulfilled without exceptions', function() {
				var sut = promise.future.then(function() { return 'hola'; });
				promise.resolve();
				expect(sut.value).toBe('hola');
			});
			it('should be fulfilled after the first future is rejected without exceptions', function() {
				var sut = promise.future.then(null, function() { return 'hola'; });
				promise.reject();
				expect(sut.value).toBe('hola');
			});

			it('should be rejected after the first future is fulfilled but throws something', function() {
				var sut = promise.future.then(function() { throw 'hola'; });
				promise.resolve();
				expect(sut.error).toBe('hola');
			});
			it('should be fulfilled after the first future is rejected but throws something', function() {
				var sut = promise.future.then(null, function() { throw 'hola'; });
				promise.reject();
				expect(sut.error).toBe('hola');
			});

			it('should be fulfilled with the same value if the first future has no resolve handler', function() {
				var sut = promise.future.then();
				promise.resolve('hola');
				expect(sut.value).toBe('hola');
			});
			it('should be rejected with the same error if the first future has no reject handler', function() {
				var sut = promise.future.then();
				promise.reject('hola');
				expect(sut.error).toBe('hola');
			});
		});

		describe('State getters', function() {
			var sut;
			beforeEach(function() {
				sut = new Promise();
			});

			describe('#isResolved method', function() {
				it('should return true if the promise is resolved', function() {
					expect(sut.future.isResolved()).toBeFalse();
					sut.resolve();
					expect(sut.future.isResolved()).toBeTrue();
				});
				it('false otherwise', function() {
					sut.reject();
					expect(sut.future.isResolved()).toBeFalse();
				});
			});

			describe('#isRejected method', function() {
				it('should return true if the promise is rejected', function() {
					expect(sut.future.isRejected()).toBeFalse();
					sut.reject();
					expect(sut.future.isRejected()).toBeTrue();
				});
				it('false otherwise', function() {
					sut.resolve();
					expect(sut.future.isRejected()).toBeFalse();
				});
			});

			describe('#isCompleted method', function() {
				it('should return true if the promise is resolved', function() {
					sut.resolve();
					expect(sut.future.isCompleted()).toBeTrue();
				});
				it('should return true if the promise is rejected', function() {
					sut.reject();
					expect(sut.future.isCompleted()).toBeTrue();
				});
				it('should return false otherwise', function() {
					expect(sut.future.isCompleted()).toBeFalse();
				})
			});
		});

		describe('#timeout method', function() {
			it('should reject the promise if it takes more than N milliseconds to resolve', function() {
				var clock = sinon.useFakeTimers();
				var sut = new Promise().future.timeout(100);
				clock.tick(120);
				expect(sut.state).toBe('failed');
			});
		});

		describe('#spread method', function() {
			it('should pass array items as arguments', function() {
				var spy = sinon.spy();
				var sut = new Promise();
				sut.future.spread(spy);
				sut.resolve([ 'hola', 'mundo' ]);
				expect(spy.calledWithExactly('hola', 'mundo')).toBeTrue();
			});
		});

		describe('#fin method', function() {
			var sut, spy;
			beforeEach(function() {
				sut = new Promise();
				spy = sinon.spy();
			})

			it('should call the callback if the promise is resolved', function() {
				sut.future.fin(spy);
				expect(spy.called).toBeFalse();
				sut.resolve();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should call the callback if the promise is rejected', function() {
				sut.future.fin(spy);
				expect(spy.called).toBeFalse();
				sut.reject();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should reject returned future if the handler throws an error', function() {
				sut.future.fin(function() { throw 'hola' }).then(null, spy);
				expect(spy.called).toBeFalse();
				sut.reject();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should reject returned future if the handler returns a future than is rejected', function() {
				var clock = sinon.useFakeTimers();
				sut.future.fin(function() { return Promise.rejected('hola') }).then(null, spy);

				sut.resolve();
				clock.tick(20);
				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledWithExactly('hola')).toBeTrue();
				clock.restore();
			});

			it('should ignore returned value otherwise', function() {
				var clock = sinon.useFakeTimers();
				sut.future.fin(function() { return 'hola' }).then(spy);
				sut.resolve('mundo');

				clock.tick(20);
				expect(spy.calledOnce).toBeTrue();
				expect(spy.calledWithExactly('mundo')).toBeTrue();
				clock.restore();
			});
		});

		describe('Modifier methods', function() {
			var sut, spy;
			beforeEach(function() {
				spy = sinon.spy();
				sut = new Promise();
			});

			function failIfNotObject(action) {
				it('should fall to error handler if the promise value is not an object', function() {
					action();
					sut.resolve();
					expect(spy.called).toBeTrue();
				});
			}

			describe('#get method', function() {
				it('should return the value of the property of the promise value', function() {
					sut.future.get('field').then(spy);
					sut.resolve({ field: 'hola' });
					expect(spy.calledWithExactly('hola')).toBeTrue();
				});
				failIfNotObject(function() {
					sut.future.get('field').then(null, spy);
				});
			});

			describe('#set method', function() {
				it('should set the property in the promise value', function() {
					sut.future.set('field', 'hola').then(spy);
					sut.resolve({});
					expect(spy.calledWith({ field: 'hola' })).toBeTrue();
				});
				failIfNotObject(function() {
					sut.future.set('field', 'hola').then(null, spy);
				});
			});

			describe('#method method', function() {
				it('should call the method of the promise value and return it\'s result', function() {
					sut.future.method('join').then(spy);
					sut.resolve([ 'hola', 'mundo' ]);
					expect(spy.calledWithExactly('hola,mundo')).toBeTrue();
				});
				it('should pass extra args to the method', function() {
	 				sut.future.method('join', '$').then(spy);
					sut.resolve([ 'hola', 'mundo' ]);
					expect(spy.calledWithExactly('hola$mundo')).toBeTrue();
				});
				failIfNotObject(function() {
					sut.future.method('field', 'hola').then(null, spy);
				});
			});

			describe('#invoke method', function() {
				it('should call the method of the promise value and return it\'s result', function() {
					sut.future.invoke('join').then(spy);
					sut.resolve([ 'hola', 'mundo' ]);
					expect(spy.calledWithExactly('hola,mundo')).toBeTrue();
				});
				it('should pass extra args to the method', function() {
	 				sut.future.invoke('join', [ '$' ]).then(spy);
					sut.resolve([ 'hola', 'mundo' ]);
					expect(spy.calledWithExactly('hola$mundo')).toBeTrue();
				});
				failIfNotObject(function() {
					sut.future.invoke('field', 'hola').then(null, spy);
				});
			});

			describe('#execute method', function() {
				it('should call the promise value and return it\'s result', function() {
					sut.future.execute().then(spy);
					sut.resolve(function() { return 'hola' });
					expect(spy.calledWithExactly('hola')).toBeTrue();
				});
				it('should pass extra args to the method', function() {
					sut.future.execute('mundo').then(spy);
					sut.resolve(function(append) { return 'hola' + append });
					expect(spy.calledWithExactly('holamundo')).toBeTrue();
				});
				failIfNotObject(function() {
					sut.future.execute().then(null, spy);
				});
			});
		});
	});
});
