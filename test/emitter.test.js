// Long lines permited
//jshint -W101

if (typeof module !== 'undefined' && module.exports === exports) {
	var sinon = require('sinon');
	var expect = require('../lib/expect');
	var Emitter = require('../src' + (process.env.CODE_COVERAGE ? '-cov' : '') + '/emitter');
}

describe('Emitter type', function() {
	'use strict';

	var sampleEvent = 'dummy';
	var anotherEvent = 'another';
	var scope = {};

	function addListener() {
		var spy = sinon.spy();
		sut.on(sampleEvent, spy, scope);
		return spy;
	}

	function emit() {
		sut.emit(sampleEvent);
	}

	var sut;
	beforeEach(function() {
		sut = new Emitter();
	});

	it('should return 0 listeners for some random signal on a new created emitter', function() {
		expect(sut.listenersCount(sampleEvent)).toBe(0);
	});

	it('should not crash if I fire a non-listened signal', function() {
		sut.emit(anotherEvent);
	});

	describe('When I add a listener...', function() {
		var spy;
		beforeEach(function() {
			spy = addListener();
		});

		it('should return 1 listeners for some random signal after on method is called with this random signal and a handler', function() {
			expect(sut.listenersCount(sampleEvent)).toBe(1);
		});

		it('another signal should have no listeners', function() {
			expect(sut.listenersCount(anotherEvent)).toBe(0);
		});

		it('should call as many listeners as I add', function() {
			var spy2 = addListener();
			emit();

			expect(spy.calledOnce).toBeTrue();
			expect(spy2.calledOnce).toBeTrue();
		});

		it('should not add the same handler if I try', function() {
			sut.on(sampleEvent, spy, scope);
			emit();
			expect(sut.listenersCount(sampleEvent)).toBe(1);
			expect(spy.calledOnce).toBeTrue();
		});

		describe('... and emit it...', function() {

			it('should call a listener binded to a signal when the emit method is called with this signal', function() {
				emit();
				expect(spy.calledOnce).toBeTrue();
			});

			it('should be called with the scope given as the thirth argument for the .on() method', function() {
				emit();
				expect(spy.calledOn(scope)).toBeTrue();
			});

			it('should call the listeners as many times as I call .emit() method', function() {
				emit();
				emit();
				expect(spy.calledTwice).toBeTrue();
			});

			it('should pass to the listeners every argument I pass to emit method except the signal name', function() {
				var arg1 = 42,
					arg2 = 'asdf',
					arg3 = {};

				sut.emit(sampleEvent, arg1, arg2, arg3);
				expect(spy.calledWithExactly(arg1, arg2, arg3)).toBeTrue();
			});
		});

		describe('... I should be able to remove it', function() {

			it('should remove a listener added by the .on() method calling the .off() with the same arguments', function() {
				sut.off(sampleEvent, spy, scope);
				expect(sut.listenersCount(sampleEvent)).toBe(0);
			});
		});
	});

	describe('Once method', function() {
		it('should add a listener who must be called only the first time the event is fired', function() {
			var spy = sinon.spy();
			sut.once(sampleEvent, spy);

			sut.emit(sampleEvent);
			expect(spy.calledOnce).toBeTrue();
			sut.emit(sampleEvent);
			expect(spy.calledOnce).toBeTrue();
		});
	});
});
