/**
 * static bool is(Object value, Object type);
 *
 * Provides a single function:
 *   bool is(value, type)
 *
 * Uses generic algorithms to detect if the is of the type.
 *   - If type is null it checks if value is null or undefined
 *   - If value is null returns false.
 *   - If type has .isTypeOf() method it invokes it passing the value the result is returned.
 *   - If the type is Object it returns true, every non-null object extends Object.
 *   - If type is a function uses instanceof operator to know if value prototypes it.
 *   - If object is native it checks if .constructor property is the type.
 *
 * If loaded on browser without AMD it will locate this function in Lang.is();
 */

(function(root) {
	"use strict";

	var undefined,
		toString = Object.prototype.toString,
		ctor = /\[object (\w+)\]/;

	function typeOf(value) {
		return toString.call(value).match(ctor)[1].toLowerCase();
	}

	/**
	 * Checks if value extends type
	 *
	 * @param value <Object> The object to check.
	 * @param type <Object> The type we expect it to be.
	 * @returns <bool> If value is from this type.
	 */
	function is(value, type) {
		if (type === null)
			return value === null || value === undefined;

		if (value === null || value === undefined)
			return false;

		if (typeof type.isTypeOf === 'function')
			return type.isTypeOf(value);

		if ((type === Object) ||
			(typeof type === 'function' && value instanceof type) ||
			(typeOf(value) !== 'object' && value.constructor === type))
			return true;

		return false;
	}

	if (typeof module !== 'undefined' && module.exports)
		module.exports.is = is;
	else if (typeof define !== 'undefined' && define.amd)
		define(function() { return is });
	else {
		root.Lang = root.Lang || {};
		root.Lang.is = is;
	}

})(this);
