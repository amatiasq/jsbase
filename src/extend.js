/**
 * Provides:
 *     Function extend(Function parent, Object config);
 *
 * It extends constructors with it's methods
 * Also provides to every method who overwrites another one
 *   with a this.base() method to invoke overwrote method.
 *
 * Created constructor has methods
 *    .extend(Object config)
 * and
 *    .inject(Object config)
 */

(function(root) {
	"use strict";

	var has = Object.prototype.hasOwnProperty;

	/**
	 * Oh come on! You don't need me to explain this.
	 */
	function each(map, callback, scope) {
		for (var i in map)
			if (has.call(map, i))
				callback.call(scope, map[i], i, map);
	}

	/**
	 * Wraps a function to garantee it has this.base() in order to cal overwrote method
	 */
	function wrap(funct, base) {
		return function() {
			var a = this.base; this.base = base;
			// If you are here and don't know what to do, debug into the next line
			var result = funct.apply(this, arguments);
			return (this.base = a), result;
		};
	}

	/**
	 * Prototypes a object and injects given configuration.
	 * Does not respect child, it can return the same object or a new one depending on browser.
	 */
	var proto = ({}).__proto__ ?
		function(child, parent) { return (child.__proto__ = parent), child } :
		function(config, parent) {
			intermediate.prototype = parent;
			var child = new intermediate();
			each(config, function(val, i) { child[i] = val });
			return child;
		};


	/**
	 * Adds every item in config to obj
	 * If it's a function it will wrap it in order to have this.base();
	 *
	 * @param obj <Object> The object where the properties will be injected.
	 * @param config <JSON> The object with methdos to inject.
	 */
	function inject(obj, config) {
		each(config, function(value, prop) {
			if (typeof value === 'function' && obj[prop])
				obj[prop] = wrap(value, obj[prop]);
			else
				obj[prop] = value;
		});
	}

	/// Dummy, just for prototype
	function intermediate() { }

	/**
	 * Creates a new function who's prototype property extend <Parent>'s prototype property.
	 *
	 * @param Parent <Function> The constructor of the type to extend.
	 * @param config <JSON> Object with methods to add to the new type.
	 * @returns <Function> The constructor of the new type.
	 */
	function extend(Parent, config) {
		config = config || {};

		// We create the constructor
		var ctor = has.call(config, 'constructor') ?
				wrap(config.constructor, Parent) :
				function ctor() { Parent.apply(this, arguments); };

		// Copy parent's statics
		inject(ctor, Parent);

		// Extend parent prototype
		intermediate.prototype = Parent.prototype
		ctor.prototype = new intermediate;

		// Add basic static methods
		ctor.extend = extend.bind(null, ctor);
		ctor.inject = inject.bind(null, ctor.prototype);

		// Apply new methods
		ctor.inject(config);
		// Fix constructor
		ctor.prototype.constructor = ctor;

		return ctor;
	}

	// extend(Object, {});

	if (typeof module !== 'undefined' && module.exports)
		module.exports = extend;
	else if (typeof define !== 'undefined' && define.amd)
		define(function() { return extend });
	else
		root.extend = extend;

})(this);
