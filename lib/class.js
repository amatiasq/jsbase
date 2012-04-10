/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {

	function wrap(object, parent, method) {
		var original = object[method];
		var code = original.toString();
		if (code.indexOf('this.base') === -1 && code.indexOf('this.proto') === -1)
			return;

		var base = parent[method];
		var base_wrapper = function base_wrapper() {
			var baseValue = this.base, protoValue = this.proto;
			(this.base = base), (this.proto = parent);
			var result = original.apply(this, arguments);
			(this.base = baseValue), (this.proto = protoValue);
			return result;
		}
		base_wrapper.toString = function() {
			return original.toString();
		};

		object[method] = base_wrapper;
	}

	var prototype = ({}).__proto__ ?
		function prototype(child, parent) {
			child.__proto__ = parent;
			return child;
		} :
		function prototype(config, parent) {
			function intermediate() { }
			intermediate.prototype = parent;
			var child = new intermediate();

			for (var i in config) if (config.hasOwnProperty(i))
				child[i] = config[i];

			return child;
		};

	function Class() { };
	Class.extend = function(config) {
		var base = this.prototype;
		config = config || {};

		if (!config.hasOwnProperty('constructor'))
			config.constructor = function() {
				this.base.apply(this, arguments);
			};

		for (var i in config) if (config.hasOwnProperty(i) && typeof config[i] === 'function')
				wrap(config, base, i);

		var clazz = prototype(config.constructor, this);
		clazz.prototype = prototype(config, this.prototype);

		if (!clazz.extend)
			clazz.extend = Class.extend;

		return clazz;
	};

	if (typeof window === 'undefined')
		module.exports = Class;
	else
		this.Class = Class;
})()