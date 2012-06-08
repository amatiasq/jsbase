/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

describe("Emitter class", function() {
	var emitter, spy;

	beforeEach(function() {
		emitter = new Emitter();
		spy = sinon.spy();
	});

	describe('on-emit relation', function() {

		it("should be able to add listeners by the on method", function() {
			emitter.on('something', spy);
		});

		beforeEach(function() {
			spy.reset();
			emitter.on('something', spy);
		})

		it("should call the listeners listening to the passed signal", function() {
			expect(spy).never.called();
			emitter.emit('something');
			expect(spy).called.once();
		});

		it("should not call the listeners of other signals", function() {
			expect(spy).never.called();
			emitter.emit('another singal');
			expect(spy).never.called();
		});

		it("should fire the listener as many times as it is added", function() {
			emitter.on('something', spy);

			expect(spy).never.called();
			emitter.emit('something');
			expect(spy).called.twice();
		});
	});

	describe("off method", function() {

		it("must disable a listener for a determined signal", function() {
			emitter.on('something', spy);

			expect(spy).never.called();
			emitter.emit('something');
			emitter.emit('something');
			expect(spy).called.twice();

			emitter.off('something', spy);

			emitter.emit('something');
			expect(spy).called.twice();
		});
	});

	describe("once method", function() {

		it("should add a listener to be fired only once", function() {
			emitter.once('something', spy);

			expect(spy).never.called();
			emitter.emit('something');
			expect(spy).called.once();
			emitter.emit('something');
			expect(spy).called.once();
			emitter.emit('something');
			expect(spy).called.once();

		});
	});
});
