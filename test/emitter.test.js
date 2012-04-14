/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

describe("Emitter class", function() {
	var emitter, spy;

	beforeEach(function() {
		emitter = new Emitter();
		spy = new sassmine.Spy();
	});

	describe('on-emit relation', function() {

		it("should be able to add listeners by the on method", function() {
			emitter.on('something', spy);
		});

		beforeEach(function() {
			spy.reset();
		})

		it("should call the listeners listening to the passed signal", function() {
			expect(spy.callCount).toBe(0);
			emitter.emit('something');
			expect(spy.callCount).toBe(1);
		});

		it("should not call the listeners of other signals", function() {
			expect(spy.callCount).toBe(0);
			emitter.emit('another singal');
			expect(spy.callCount).toBe(0);
		});

		it("should fire the listener as many times as it is added", function() {
			emitter.on('something', spy);

			expect(spy.callCount).toBe(0);
			emitter.emit('something');
			expect(spy.callCount).toBe(2);
		});
	});

	describe("off method", function() {

		it("must disable a listener for a determined signal", function() {
			emitter.on('something', spy);

			expect(spy.callCount).toBe(0);
			emitter.emit('something');
			emitter.emit('something');
			expect(spy.callCount).toBe(2);

			emitter.off('something', spy);

			emitter.emit('something');
			expect(spy.callCount).toBe(2);
		});
	});

	describe("once method", function() {

		it("should add a listener to be fired only once", function() {
			emitter.once('something', spy);

			expect(spy.callCount).toBe(0);
			emitter.emit('something');
			expect(spy.callCount).toBe(1);
			emitter.emit('something');
			expect(spy.callCount).toBe(1);
			emitter.emit('something');
			expect(spy.callCount).toBe(1);

		});
	});
});
