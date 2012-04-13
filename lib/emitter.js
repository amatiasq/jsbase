/**
 * Copyright � 2009-2012 A. Mat�as Quezada
 */

(function() {

	if (typeof window === 'undefined')
		module.exports = Emitter;
	else
		this.Emitter = Emitter;

	if (typeof Class === 'function' && typeof Class.extend === 'function')
		Emitter.extend = Class.extend;

	function Emitter() {
		this._listeners = {};
	}
	Emitter.prototype = {
		constructor: Emitter,

		emit: function(event, var_args) {
			var list = this._listeners[event];
			if (!list)
				return;

			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0, len = list.length; i < len; i++)
				list[i].apply(null, args);
		},

		on: function(event, listener) {
			if (!this._listeners[event])
				this._listeners[event] = [];

			this._listeners[event].push(listener);
			this.emit('newListener', event, listener);
		},

		once: function(event, listener) {
			var self = this;

			this.on(event, function() {
				self.removeListener(event, listener);
				listener.apply(null, arguments);
			});
		},

		off: function(event, listener) {
			var list = this._listeners[event];
			if (!list)
				return;

			var index = list.indexOf(listener);
			if (index !== -1)
				list.splice(index, 1);

		}
	};
	
})();