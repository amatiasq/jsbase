describe("Base object", function() {

	describe(".extend() method", function() {

		describe("empty class creation", function() {
			var test = Base.extend();

			it("should be a function and must have the extend method", function() {
				expect(test).toBeFunction();
				expect(test.extend).toBeFunction();
			});

			it("should the prototype of the result function should be ", function() {
				expect(Object.getPrototypeOf(test.prototype)).toBe(Base.prototype);
			});
		});

		describe("class creation with methods", function() {

			describe("must create a class with the given methods", function() {
				var original = function() { };
				var test = Base.extend({
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
					expect(Base.prototype.method1).not.toBe(original);
					expect(Base.prototype.method2).not.toBe(original);
				});
			});

			it("should provide this.proto to access the parent class prototype", function() {
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

		describe("subclases generation", function() {

			var First = Base.extend({
				someMethod: function() { }
			});
			First.staticMethod = function() { };

			describe("should extend the class just as Base.extend", function() {
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
				var mock;

				beforeEach(function() {
					mock = sinon.mock(First.prototype);
				});

				afterEach(function() {
					mock.restore();
				})

				it("must throw a exception if we try to use this.base() in a non-override method", function() {
					expect(function() {
						Base.extend({
							unexisting: function() {
								this.base();
							}
						});
					}).toThrowError();
				});

				it("should call the parent method", function() {
					mock.expects('someMethod').once();

					var test = First.extend({
						someMethod: function() {
							this.base();
						}
					});
					new test().someMethod();

					mock.verify();
				});

				it("should pass the arguments to the parent method", function() {
					var obj = {};
					mock.expects('someMethod').once().withExactArgs(1, 'asdf', obj);

					var test = First.extend({
						someMethod: function() {
							this.base(1, "asdf", obj);
						}
					});
					new test().someMethod();

					mock.verify();
				});
			});

		});
	});
});
