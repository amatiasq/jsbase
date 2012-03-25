/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

var global;

(function(self) {

	global = self;

	function resolveNamespace(ns) {
		var path = ns.split('.');

		var current = use.root;
		for (var i = 0; i < path.length; i++)
			current = current[path[i]] = current[path[i]] || {};

		return current;
	}

	function use(var_args) {
		var namespaces = [];

		for (var i = 0; i < arguments.length; i++)
			namespaces[i] = resolveNamespace(arguments[i]);

		return {
			on: function(callback) {
				callback.apply(use.root, namespaces);
			}
		};
	}

	use.root = global;
	global.use = use;

})(this);

use().on(function() {

	function wrap(object, parent, method) {
		var original = object[method];
		var base = parent[method];
		var init = method === 'init';

		function wrapper() {
			var baseValue = this.base, protoValue = this.proto;
			(this.base = base), (this.proto = parent);
			var result = original.apply(this, arguments);
			(this.base = baseValue), (this.proto = protoValue);
			return result;
		}
		wrapper.toString = function() {
			return original.toString();
		};

		object[method] = wrapper;
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

	var Class = global.Class = function() { };
	Class.__proto__ = Function.prototype;
	Class.prototype = { constructor: Class };

	Class.extend = function(config) {
		var base = this.prototype;
		config = config || {};

		if (!config.hasOwnProperty('constructor'))
			config.constructor = function() {
				if (!this.base)
					debugger;
				this.base();
			};

		for (var i in config) if (config.hasOwnProperty(i) && typeof config[i] === 'function')
				wrap(config, base, i);

		var clazz = prototype(config.constructor, this);
		clazz.prototype = prototype(config, this.prototype);
		return clazz;
	};
});
