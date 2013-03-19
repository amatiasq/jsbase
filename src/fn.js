/**
 * static Function prop(String name, Object value);
 * static Function funct(String name, Object var_args...);
 * static Function returner(Object value);
 * static Object pipe(Object value);
 */

(function(root) {
	'use strict';

	function array(obj, from) {
		return Array.prototype.slice.call(obj, from);
	}

	function prop(name, value) {
		// jsHint warns about returning the result of a asignation on the second function
		//jshint -W093
		return arguments.length === 1 ?
			function(item) { return item[name] } :
			function(item) { return item[name] = value };
	}

	function funct(name /*, var_args*/) {
		var args = array(arguments, 1);
		return args.length ?
			function(item) { return item[name].apply(item, args) } :
			function(item) { return item[name]() };
	}

	function returner(value) {
		return function() {
			return value;
		};
	}

	function pipe(item) {
		return item;
	}

	var fn = {
		prop: prop,
		funct: funct,
		returner: returner,
		pipe: pipe,
	};

	if (typeof module !== 'undefined' && module.exports)
		module.exports = fn;
	else if (typeof define !== 'undefined' && define.amd)
		define(function() { return fn });
	else
		root.fn = fn;

})(this);
