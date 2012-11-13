/*

interface Lang {
	static bool is(Object value, Object type);
}

*/

(function(root) {
	"use strict";

	var undefined,
		toString = Object.prototype.toString,
		ctor = /\[object (\w+)\]/;

	function typeOf(value) {
		return toString.call(value).match(ctor)[1].toLowerCase();
	}

	function is(value, type) {
		if (type === Object)
			return true;

		if (typeof type === 'function' && value instanceof type)
			return true;

		if (typeOf(value) !== 'object')
			if (type.constructor === type)
				return true;

		if (typeof type.isTypeOf === 'function')
			return type.isTypeOf(value);

		return false;
	}

	var Lang = { is: is };

	if (typeof module !== 'undefined' && module.exports)
		module.exports = Lang;
	else if (typeof define !== 'undefined' && define.amd)
		define(function() { return Lang });
	else
		root.Lang = Lang;

})(this);
