/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {
	
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

	use.isCommonJS = typeof window === 'undefined';

	use.root = {};
	this.use = use;

	if (use.isCommonJS)
		module.exports = use;

})();
