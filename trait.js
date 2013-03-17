/**
 * Trait
 * Copyright(c) 2013-2020 Gao Xiaochen <gxcsoccer@126.com>
 */

// Utility functions
var isFunction = function(fn) {
		return typeof fn === "function";
	};

var required = function() {};

var slice = Array.prototype.slice;

var makeRequiredPropDesc = function() {
		return {
			value: undefined,
			configurable: true,
			required: true
		};
	};
// End of Utility
/**
 *  Public API
 */
var Trait = {
	/**
	 * create trait
	 *
	 * @param {Mixin} obj
	 * @api public
	 */
	trait: function(obj) {
		var map = {},
			propNames = Object.getOwnPropertyNames(obj)

			propNames.forEach(function(name) {
				var pd = Object.getOwnPropertyDescriptor(obj, name);
				var value = pd.value || pd.get || pd.set;
				if (value === required) {
					pd = makeRequiredPropDesc();
				} else {
					// mark it as method
					isFunction(value) && (pd.method = true);
				}
				map[name] = pd;
			});

		return map;
	},
	/**
	 * compose mutiple trait together
	 *
	 * @api public
	 */
	compose: function() {
		var args = Array.prototype.slice.call(arguments, 0);
		var newTrait = {};

		args.forEach(function(trait) {
			for (var name in trait) {
				if (name in newTrait) {
					newTrait[name] = {
						conflict: true
					};
				} else {
					newTrait[name] = trait[name];
				}
			}
		});

		return newTrait;
	},
	/**
	 * try to resolve conflict
	 *
	 * @param {Object} pd
	 * @param {Trait} trait
	 * @api public
	 */
	resolve: function(pd, trait) {
		pd = pd || {};
		var newTrait = {};

		for (var name in trait) {
			if (name in pd) {
				if (pd[name] != null) {
					newTrait[pd[name]] = trait[name];
				}
			} else {
				newTrait[name] = trait[name];
			}
		}

		return newTrait;
	},
	/**
	 * the latter one override the former one
	 *
	 * @api public
	 */
	override: function() {
		var args = Array.prototype.slice.call(arguments, 0);
		var newTrait = {};

		args.forEach(function(trait) {
			for (var name in trait) {
				newTrait[name] = trait[name];
			}
		});

		return newTrait;
	},
	/**
	 * create new object, combine proto and trait properties
	 *
	 * @param {Object} proto
	 * @param {Trait} trait
	 * @api public
	 */
	create: function(proto, trait) {
		var obj = Object.create(proto);
		return this.mixin(obj, trait);
	},
	/**
	 * mix the trait into obj
	 *
	 * @param {Object} obj
	 * @param {Trait} trait
	 * @api public
	 */
	mixin: function(obj, trait) {
		if (!obj) {
			return null;
		}

		var pd, properties = {};
		for (var name in trait) {
			pd = trait[name];
			if (pd.required) {
				if (!(name in obj)) {
					throw new Error('Missing required property: ' + name);
				}
			} else if (pd.conflict) {
				throw new Error('Still have conflict property' + name);
			} else if (pd.method) {
				pd = {
					value: pd.value.bind(obj),
					enumerable: pd.enumerable,
					configurable: pd.configurable,
					writable: pd.writable
				}
			}
			properties[name] = pd;

		}

		Object.defineProperties(obj, properties);
		return obj;
	},
	required: required
};

if (typeof exports !== "undefined") { // CommonJS module support
	module.exports = Trait;
}