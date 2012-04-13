/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

describe("Emitter class", function() {

	describe('on-emit relation', function() {
		var emitter = new Emitter();
		var spy = new sassmine.Spy();

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
	});
});
