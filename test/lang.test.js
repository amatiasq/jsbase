describe('Lang class', function() {

	var types = [
		Object,
		null,
		Boolean,
		Number,
		String,
		Function,
		Array,
		Date
	];

	var validValues = [
		[ {}, new Object() ],
		[ null, undefined ],
		[ true, false, new Boolean(), new Boolean(true), new Boolean(false) ],
		[ 0, 1, 2.3, -0, -1, -2.3, new Number(), new Number(1) ],
		[ "", "hi", "!$%&/()=", new String(), new String(""), new String("adf") ],
		[ function() { } ],
		[ [], ['a',1,true], new Array(), new Array(1), new Array('a',1,true) ],
		[ new Date() ]
	];

	eachValidValue(function(a, b, count) { eachValidValue.count = count });
	function eachValidValue(callback) {
		var count = 0,
			i, len, j, jlen;

		// Every value except null ones should pass with Object
		for (i = 0, len = validValues.length; i < len; i++)
			if (i !== 1)
				for (j = 0, len = validValues[i].length; j < len; j++)
					callback(Object, validValues[i][j], ++count);

		// Test every type with it's valid values
		for (i = 1, len = types.length; i < len; i++)
			for (j = 0, jlen = validValues[i].length; j < jlen; j++)
				callback(types[i], validValues[i][j], ++count);
	}

	eachInvalidValue(function(a, b, count) { eachInvalidValue.count = count });
	function eachInvalidValue(callback) {
		var count = 0,
			i, len, j, jlen, k, klen;

		// Object should fail with null values
		for (i = 0, len = validValues[1].length; i < len; i++)
			callback(Object, validValues[1][i], ++count);

		// Test each type with all values except itself
		for (i = 1, len = types.length; i < len; i++)
			for (j = 0, jlen = validValues.length; j < jlen; j++)
				if (j !== i)
					for (k = 0, klen = validValues[j].length; k < klen; k++)
						callback(types[i], validValues[j][k], ++count);
	}


	describe('#is method', function() {

		describe('if the type has a method isTypeOf...', function() {
			describe('... and it returns true', function() {
				var type = {
					isTypeOf: function() {
						return true;
					}
				};

				it('should return true', function() {
					expect(Lang.is({}, type)).toBeTrue();
				});
				it('unless value is null or undefined', function() {
					var undefined;
					expect(Lang.is(null, type)).toBeFalse();
					expect(Lang.is(undefined, type)).toBeFalse();
				});
			});

			describe('... and it returns false', function() {
				var type = {
					isTypeOf: function() {
						return false;
					}
				};

				it('should return false', function() {
					expect(Lang.is({}, type)).toBeFalse();
				});
			});
		});

		describe('with native types', function() {
			eachValidValue(function(type, value) {
				it('should return true when type is ' + (type && type.name) + ' and value is ' + value, function() {
					expect(Lang.is(value, type)).toBeTrue();
				});
			});

			eachInvalidValue(function(type, value) {
				it('should return false when type is ' + (type && type.name) + ' and value is ' + value, function() {
					expect(Lang.is(value, type)).toBeFalse();
				});
			});
		});

	});
});
