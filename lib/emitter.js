/**
 * Copyright © 2009-2012 A. Matías Quezada
 */

(function() {

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

			this.on(event, function wrapper() {
				self.off(event, wrapper);
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

	if (typeof Base === 'function')
		Emitter = Base.extend(Emitter.prototype);

	if (typeof window === 'undefined')
		module.exports = Emitter;
	else
		this.Emitter = Emitter;

})();
