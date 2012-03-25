/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

var dummy;
describe('use function', function() {
	describe('package creation', function() {

		it('should create the package if it does not exist', function() {
			expect(dummy).toBeUndefined();
			use('dummy');
			expect(dummy).not.toBeFunction();

			it('even with many arguments', function() {
				expect(dummy.a).toBeUndefined();
				expect(dummy.b).toBeUndefined();
				use('dummy.a', 'dummy.b');
				expect(dummy.a).not.toBeUndefined();
				expect(dummy.b).not.toBeUndefined();
			});
		});

		it('should parse the name if it has dot notation', function() {
			expect(dummy.test).toBeUndefined();
			use('dummy.test');
			expect(dummy.test).not.toBeUndefined();
		});

		it('should allow invalid identifiers as hidden packages', function() {
			use('dummy ---~~#½{¬{¬¬@#~½@#~.test')
		});
	});

	describe('callback execution', function() {

		it('must execute the on function inmediatly', function() {
			var a = 1
			use('dummy').on(function() { a = 2 });
			expect(a).toBe(2);
		});

		it('should pass the package to the on', function() {
			var dum = dummy;
			use('dummy').on(function() {
				expect(dummy).toBe(dum);
			});

			it('even with many arguments', function() {
				use('dummy.a', 'dummy.b').on(function(a, b) {
					expect(a).toBe(dummy.a);
					expect(b).toBe(dummy.b);
				});
			});
		});

	});
});

describe('Class creation', function() {

	it('should return a function', function() {
		expect(Class.extend()).toBeFunction();
	});

	it('should prototype the instances', function() {
		var a = Class.extend({ temp: 1 });
		expect(new a().temp).toBe(1);
	});

	it('must return extensible classes', function() {
		var A = Class.extend({ temp: 1 });
		var B = A.extend({ other: 2 });
		expect(new B().temp).toBe(1);
	});

	it('should call constructor on instanciation', function() {
		var spy = new Spy();
		var A = Class.extend({
			constructor: spy.spy
		});

		expect(spy.callCount).toBe(0);
		new A();
		expect(spy.callCount).toBe(1);
	});

	describe('base method behaviour', function() {

		it('should allow us to call parent class method', function() {
			var spy = new Spy();

			var A = Class.extend({
				test: spy.spy
			});
			var B = A.extend({
				test: function() {
					this.base();
				}
			});

			expect(spy.callCount).toBe(0);
			new B().test();
			expect(spy.callCount).toBe(1);

			it('even with constructors', function() {
				var spy = new Spy();

				var A = Class.extend({
					constructor: spy.spy
				});
				var B = A.extend({
					constructor: function() {
						this.base();
					}
				});

				expect(spy.callCount).toBe(0);
				new B();
				expect(spy.callCount).toBe(1);
			});
		});

		it('must return the parent method result', function() {
			var A = Class.extend({
				test: function() {
					return 'testingcode';
				}
			});
			var B = A.extend({
				test: function() {
					return this.base();
				}
			});

			expect(new B().test()).toBe('testingcode');
		});

		it('must work with many inheritance levels', function() {
			var spy = new Spy();

			var A = Class.extend({
				test: spy.spy
			});
			var B = A.extend({
				test: function() {
					this.base();
				}
			});
			var C = B.extend({
				test: function() {
					this.base();
				}
			});
			var D = C.extend({
				test: function() {
					this.base();
				}
			});

			expect(spy.callCount).toBe(0);
			new D().test();
			expect(spy.callCount).toBe(1);
		});
	});

});