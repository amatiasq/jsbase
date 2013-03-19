if (typeof module !== 'undefined' && module.exports === exports) {
	var sinon = require('sinon');
	var expect = require('../lib/expect');
	var extend = require('../src' + (process.env.CODE_COVERAGE ? '-cov' : '') + '/extend');
}

describe('extend() function', function() {
	'use strict';

	function testBase(creator) {
		it('should add every method I pass to the function to the created Type', function() {
			function a() { }
			var SubType = creator({ a: a });
			var sut = new SubType;
			expect(sut.a).toBe(a);
		});

		it('should provide the method with a this.base() function to call the overwitten method', function() {
			var spy = sinon.spy();

			var SubType = creator({ a: spy });
			var FinalType = creator({ a: function() { this.base() } }, SubType);

			var sut = new FinalType();
			sut.a();

			expect(spy.calledOnce).toBeTrue();
		});

		it('should return the value returned by the parent method if I return the result of this.base()', function() {
			var result = 'hello!';

			var SubType = creator({ a: function() { return result } });
			var FinalType = creator({ a: function() { return this.base() } }, SubType);

			var sut = new FinalType();
			expect(sut.a()).toBe(result);
		});
	}

	function testInstance(Type) {
		var sut;
		beforeEach(function() {
			sut = new Type;
		});

		it('should return a object', function() {
			expect(sut).not.toBeFalsy();
		});

		it('should return true when use instanceof operator over the Type', function() {
			expect(sut instanceof Type).toBeTrue();
		});
	}

	function testType(Type, Parent) {
		it('should be a function', function() {
			expect(Type).toBeFunction();
		});

		it('should have a extend method', function() {
			expect(Type.extend).toBeFunction();
		});

		it('should have a inject method', function() {
			expect(Type.inject).toBeFunction();
		});

		it('should prototype the first passed type', function() {
			expect(Object.getPrototypeOf(Type.prototype)).toBe(Parent.prototype);
		});

		describe('Instances behaviour', function() {
			testInstance(Type);
		});

		describe('#inject method', function() {
			it('should modify current type', function() {
				var SubType = Type.extend();
				SubType.inject({ a: '1' });
				expect(SubType.prototype.a).toBe('1');
			});

			var Sub;
			beforeEach(function() {
				Sub = Type.extend();
			});

			testBase(function(config) {
				Sub.inject(config);
				return Sub;
			});
		});

		describe('#extend method', function() {
			it('should return a new Type', function() {
				var SubType = Type.extend();
				expect(SubType).toBeFunction();
				expect(SubType).not.toBe(Type);
			});

			testBase(function(config, Base) {
				return (Base || Type).extend(config);
			});
		});
	}

	describe('Returned object should be a Type', function() {
		testType(extend(Object), Object);

		describe('Who also can create SubTypes recursively', function() {
			var Type = extend(Object);
			testType(Type.extend(), Type);
		});
	});
});
	/*

	describe('.extend() method', function() {

		describe('empty class creation', function() {
			var test = Base.extend();

			it('should be a function and must have the extend method', function() {
				expect(test).toBeFunction();
				expect(test.extend).toBeFunction();
			});

			it('should the prototype of the result function should be ', function() {
				expect(Object.getPrototypeOf(test.prototype)).toBe(Base.prototype);
			});
		});

		describe('class creation with methods', function() {

			describe('must create a class with the given methods', function() {
				var original = function() { };
				var test = Base.extend({
					method1: original,
					method2: original
				});

				expect(test.prototype.method1).toBe(original);
				expect(test.prototype.method2).toBe(original);

				it('instances should have those methods', function() {
					var a = new test();
					expect(a.method1).toBe(original);
					expect(a.method2).toBe(original);
				});

				it('should not modify the parent class', function() {
					expect(Base.prototype.method1).not.toBe(original);
					expect(Base.prototype.method2).not.toBe(original);
				});
			});

			it('should provide this.proto to access the parent class prototype', function() {
				var proto;
				var test = Base.extend({
					someMethod: function() {
						proto = this.proto;
					}
				});

				new test().someMethod();
				expect(proto).toBe(Base.prototype);
			});

		});

		describe('subclases generation', function() {

			var First = Base.extend({
				someMethod: function() { }
			});
			First.staticMethod = function() { };

			describe('should extend the class just as Base.extend', function() {
				var test = First.extend({
					otherMethod: function() { }
				});
				var a = new test();

				expect(a.otherMethod).toBeFunction();

				it('should inherit methods from First class', function() {
					expect(a.someMethod).toBeFunction();
				});

				it('should not modify the parent class', function() {
					expect(First.prototype.otherMethod).not.toBeFunction();
				});
			});

			it('should extend event static properties', function() {
				var temp = First.extend();
				expect(temp.staticMethod).toBe(First.staticMethod);
			});

			describe('this.base() functionallity', function() {
				var mock;

				beforeEach(function() {
					mock = sinon.mock(First.prototype);
				});

				afterEach(function() {
					mock.restore();
				})

				it('must throw a exception if we try to use this.base() in a non-override method', function() {
					expect(function() {
						Base.extend({
							unexisting: function() {
								this.base();
							}
						});
					}).toThrowError();
				});

				it('should call the parent method', function() {
					mock.expects('someMethod').once();

					var test = First.extend({
						someMethod: function() {
							this.base();
						}
					});
					new test().someMethod();

					mock.verify();
				});

				it('should pass the arguments to the parent method', function() {
					var obj = {};
					mock.expects('someMethod').once().withExactArgs(1, 'asdf', obj);

					var test = First.extend({
						someMethod: function() {
							this.base(1, 'asdf', obj);
						}
					});
					new test().someMethod();

					mock.verify();
				});
			});

		});
	});
});
*/
