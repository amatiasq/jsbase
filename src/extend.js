/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function(root) {
	"use strict";

	var has = Object.prototype.hasOwnProperty;

	function each(map, callback, scope) {
		for (var i in map)
			if (has.call(map, i))
				callback.call(scope, map[i], i, map);
	}

	///
	/// Adds every item in config to obj
	/// If it's a function it will wrap it in order to have this.base();
	///
	function inject(obj, config) {
		each(config, function(value, prop) {
			if (typeof value === 'function' && obj[prop])
				obj[prop] = wrap(value, obj[prop]);
			else
				obj[prop] = value;
		});
	}

	///
	/// Wraps a function to garantee it has this.base() in order to cal overwrote method
	///
	function wrap(funct, base) {
		return function() {
			var a = this.base; this.base = base;
			// If you are here and don't know what to do, debug into the next line
			var result = funct.apply(this, arguments);
			return (this.base = a), result;
		};
	}

	///
	/// Prototypes a object and injects given configuration
	///
	var proto = ({}).__proto__ ?
		function(child, parent) { return (child.__proto__ = parent), child } :
		function(config, parent) {
			intermediate.prototype = parent;
			var child = new intermediate();
			each(config, function(val, i) { child[i] = val });
			return child;
		};

	/// Dummy, just for prototype
	function intermediate() { }

	///
	/// Creates a new function who's prototype property extend <Parent>'s prototype property.
	///
	function extend(Parent, config) {
		config = config || {};

		// We create the constructor
		var ctor = has.call(config, 'constructor') ?
				wrap(config.constructor, this) :
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
