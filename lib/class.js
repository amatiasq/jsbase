/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {
	var has = {}.hasOwnProperty,
		contains = has.call.bind(has);

	/**
	 * Analyzes the property <tt>method</tt> of <tt>object</tt>, and if it is a
	 * function and uses <code>this.base</code> or <code>this.proto</code> wraps
	 * it to allow provide base class access.
	 *
	 * If it does not uses this properties it will not be wrapped.
	 *
	 * @param {Object} object The object than contains the method.
	 * @param {Object} parent The object to use as base.
	 * @param {String} method The name of the method to wrap.
	 */
	function wrap(object, parent, method) {
		var original = object[method],
			code = original.toString(),
			base = parent[method],
			baseIndex = code.indexOf('this.base'),
			wrapper;

		// If the code doesn't use this.base or this.proto it doesn't need a wrapper
		if (baseIndex === -1 && code.indexOf('this.proto') === -1)
			return;

		if (baseIndex !== -1 && typeof base != 'function')
			throw new Error('Method --[' + method + "]-- doesn't overrides any method. So it has no base.");

		object[method] = createWrapper(original, base, parent);
		object[method].toString = returner(code);
	}

	function createWrapper(original, base, parent) {
		return function wrapper() {
			var origBase = this.base, origProto = this.proto;
			(this.base = base), (this.proto = parent);

			// If you are here and don't know what to do, debug into the next line
			var result = original.apply(this, arguments);

			(this.base = origBase), (this.proto = origProto);
			return result;
		};
	}

	function returner(val) {
		return function() { return val };
	}


	/**
	 * It prototypes <tt>parent</tt> and add every property on <tt>child</tt> to
	 * the new object.
	 *
	 * WARNING: Depending on browser functionallities, the returned object can be
	 * the same passed as <tt>child</tt> argument with parent as prototype. Keep
	 * in mind than if this ocurs any modification to the returned object will
	 * modify the <tt>child</tt> object. Because of this is recommended to always
	 * call this method directly creating child as a JSON:
	 * <code>prototype({ a: 1 }, Error)</code>
	 *
	 * @param {Object} child The properties to inject on the new object.
	 * @param {Object} parent The object to prototype
	 * @returns {Object} A new object who has <tt>parent</tt> as prototype and
	 *   every method on <tt>child</tt>
	 */
	var prototype = ({}).__proto__ ?
		function prototype(child, parent) {
			child.__proto__ = parent;
			return child;
		} :
		function prototype(config, parent) {
			function intermediate() { }
			intermediate.prototype = parent;
			var child = new intermediate();

			for (var i in config) if (contains(config, i))
				child[i] = config[i];

			return child;
		};

	function Base() { };
	Base.extend = function(config) {
		var base = this.prototype;
		config || (config = {});

		if (!contains(config, 'constructor'))
			config.constructor = function() { this.base.apply(this, arguments); };

		for (var i in config) if (contains(config, i) && typeof config[i] === 'function')
			wrap(config, base, i);

		var clazz = prototype(config.constructor, this);
		clazz.prototype = prototype(config, this.prototype);

		if (!clazz.extend)
			clazz.extend = Base.extend;

		return clazz;
	};

	if (typeof window !== 'undefined' && this === window) {
		window.Base = Base;
	} else {
		module.exports = Base;
	}

})();
