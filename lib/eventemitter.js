(function() {

	if (typeof window === 'undefined')
		module.exports = EventEmitter;
	else
		this.EventEmitter = EventEmitter;

	if (typeof Class === 'function' && typeof Class.extend === 'function')
		EventEmitter.extend = Class.extend;

	function EventEmitter() {
		this._listeners = {};
	}
	EventEmitter.prototype = {
		constructor: EventEmitter,

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

		removeListener: function(event, listener) {
			var list = this._listeners[event];
			if (!list)
				return;

			var index = list.indexOf(listener);
			if (index !== -1)
				list.splice(index, 1);
		},

		removeAllListeners: function(event) {
			var list = this._listeners[event];
			if (list)
				list.length = 0;
		}
	};
	
})();