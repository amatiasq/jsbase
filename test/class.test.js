/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

describe("Class object", function() {
	describe("extend method", function() {
		it("should return a function who has the extend function", function() {
			var test = Class.extend();
			expect(test).toBeFunction();
		});
	});
});