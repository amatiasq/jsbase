(function() {

	var InterfaceError = Base.extend.call(Error);
	var InterfaceDefinitionError = Base.extend.call(Error);

	function Interface(config) {
		this.methods = [];

		var value;
		for (var i in config) {
			value = config[i];

			if (config.hasOwnProperty(i)) {
				if (typeof value !== 'function')
					throw new InterfaceDefinitionError("Interface can only contain functions");
				this.methods.push({ name: i, funct: value });
			}
		}
	}

	Interface.implement = function() {
		var interfaces = Array.prototype.slice.call(arguments);
		var clazz = interfaces.pop();

		for (var i = 0, len = interfaces.length; i < len; i++)
			interfaces[i].check(clazz);
		for (var i = 0, len = interfaces.length; i < len; i++)
			interfaces[i].apply(clazz);
	};

	Interface.prototype = {
		constructor: Interface,

		implement: function(clazz) {
			this.check(clazz);
			this.apply(clazz);
		},

		check: function(clazz) {
			if (clazz.is(this))
				return;

			var proto = clazz.prototype;
			var methods = this.methods;

			var item;
			for (var i = 0, len = methods.length; i < len; i++) {
				item = methods[i];

				if (typeof proto[item.name] !== 'function')
					this.fail('NOT_IMPLEMENTED', item);

				//if (proto[item.name].length < item.args)
				//	this.fail('NOT_ENOUGHT_ARGUMENTS');
			}
		},

		apply: function(clazz) {
			var proto = clazz.prototype;
			var methods = this.methods;

			var item;
			for (var i = 0, len = methods.length; i < len; i++)
				this.wrapMethod(methods[i].funct, proto[methods[i].name]);
		},

		wrapMethod: function(ifaceMethod, clazzMethod) {
			var self = this;
			return function() {
				ifaceMethod.apply(self, arguments);
				clazzMethod.apply(this, arguments);
			};
		},

		fail: function(code, data) {
			switch (code) {
				case 'NOT_IMPLEMENTED':
					throw new InterfaceError('The object does not implements the method ' + data.name);

				//case 'NOT_ENOUGHT_ARGUMENTS':
				//	throw new InterfaceError('The object implements the method ' + item.name + ' with less than minimimum arguments: ' + item.args);
			}
		}
	};

})();

function signature(var_args) {
	var args = Array.prototype.slice.call(arguments);
	return function() {
		for (var i = 0, len = args.length; i < len; i++)
			Interface.is(arguments[i])
	}
}

var D

var IEventHandler = Interface.define({
	addListener: signature(String /* signal */, Function /* handler */, opt(Boolean) /* capturing */)
	removeListener: [
		signature(Number /* event id */),
		signature(String /* signal */, Function /* handler */, opt(Boolean) /* capturing */)
	]
})
