(function(root) {
	"use strict";

	function equals(handler, scope, expected) {
		return function(item) {
			return (
				item.funct === handler &&
				item.scope === scope
			) === expected;
		};
	}

	function Emitter() {
		this._listeners = {};
	}

	Emitter.prototype = {
		listenersCount: function(signal) {
			var list = this._listeners[signal];
			return  list ? list.length : 0;
		},

		on: function on(signal, handler, scope) {
			var list = this._listeners;

			if (!list[signal])
				list[signal] = [];

			if (list[signal].some(equals(handler, scope, true)))
				return;

			list[signal].push({
				funct: handler,
				scope: scope
			});
		},

		off: function off(signal, handler, scope) {
			var list = this._listeners[signal];
			if (!list)
				return;

			this._listeners[signal] = list.filter(equals(handler, scope, false));
		},

		emit: function emit(signal) {
			var list = this._listeners[signal];
			if (!list)
				return;

			var data = Array.prototype.slice.call(arguments, 1);
			list.forEach(function(item) {
				item.funct.apply(item.scope, data);
			});
		}
	};

	if (typeof Base === 'function')
		Emitter = Base.extend(Emitter.prototype);

	if (typeof module !== 'undefined' && module.exports)
		module.exports = Emitter;
	else if (typeof define !== 'undefined' && define.amd)
		define(function() { return Emitter });
	else
		root.Emitter = Emitter;

})(this);
