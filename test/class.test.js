/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

describe("Class object", function() {

	describe(".extend() method", function() {

		describe("empty class creation", function() {
			var test = Class.extend();

			it("should be a function and must have the extend method", function() {
				expect(test).toBeFunction();
				expect(test.extend).toBeFunction();
			});

			it("should the prototype of the result function should be ", function() {
				expect(Object.getPrototypeOf(test.prototype)).toBe(Class.prototype);
			});
		});

		describe("class creation with methods", function() {

			it("must create a class with the given methods", function() {
				var original = function() { };
				var test = Class.extend({
					method1: original,
					method2: original
				});

				expect(test.prototype.method1).toBe(original);
				expect(test.prototype.method2).toBe(original);

				it("instances should have those methods", function() {
					var a = new test();
					expect(a.method1).toBe(original);
					expect(a.method2).toBe(original);
				});

				it("should not modify the parent class", function() {
					expect(Class.prototype.method1).not.toBe(original);
					expect(Class.prototype.method2).not.toBe(original);
				});
			});

			it("should provide this.proto to access the parent class prototype", function() {
				var proto;
				var test = Class.extend({
					someMethod: function() {
						proto = this.proto;
					}
				});

				new test().someMethod();
				expect(proto).toBe(Class.prototype);
			});

		});

		describe("subclases generation", function() {

			var First = Class.extend({
				someMethod: function() { }
			});
			First.staticMethod = new sassmine.Spy()
			sassmine.Spy.spyMethod(First, 'someMethod');

			it("should extend the class just as Class.extend", function() {
				var test = First.extend({
					otherMethod: function() { }
				});
				var a = new test();

				expect(a.otherMethod).toBeFunction();

				it("should inherit methods from First class", function() {
					expect(a.someMethod).toBeFunction();
				});

				it("should not modify the parent class", function() {
					expect(First.prototype.otherMethod).not.toBeFunction();
				});
			});

			it("should extend event static properties", function() {
				var temp = First.extend();
				expect(temp.staticMethod).toBe(First.staticMethod);
			});

			describe("this.base() functionallity", function() {
				beforeEach(function() {
					First.prototype.someMethod.reset();
				});

				it("must throw a exception if we try to use this.base() in a non-override method", function() {
					expect(function() {
						Class.extend({
							unexisting: function() {
								this.base();
							}
						});
					}).toThrowError();
				});

				it("should call the parent method", function() {
					var test = First.extend({
						someMethod: function() {
							this.base();
						}
					});

					expect(First.prototype.someMethod.callCount).toBe(0);
					new test().someMethod();
					expect(First.prototype.someMethod.callCount).toBe(1);
				});

				it("should pass the arguments to the parent method", function() {
					var obj = {};
					var test = First.extend({
						someMethod: function() {
							this.base(1, "asdf", obj);
						}
					});

					expect(First.prototype.someMethod.callCount).toBe(0);
					new test().someMethod();
					expect(First.prototype.someMethod.callCount).toBe(1);

					var args = First.prototype.someMethod.lastArguments;
					expect(args[0]).toBe(1);
					expect(args[1]).toBe("asdf");
					expect(args[2]).toBe(obj);
				});
			});
		});
	});
});
