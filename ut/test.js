//var assert = require("assert");
var should = require("should");
var Trait = require("../trait");

describe("Trait", function() {
	it("should return something when calling trait", function() {
		should.exist(Trait.trait({
			equals: function(x) {
				return this === x;
			}
		}));
	});

	it("should have equals property in the trait", function() {
		Trait.trait({
			equals: function(x) {
				return this === x;
			}
		}).should.have.property("equals");
	});

	it("should return a new obj when calling create function", function() {
		should.exist(Trait.create(null, Trait.trait({
			equals: function(x) {
				return this === x;
			}
		})));
	});

	it("new obj should have the properties both in proto and trait", function() {
		var proto = {
			a: "aaa"
		};
		var trait = Trait.trait({
			b: "bbb"
		});
		var obj = Trait.create(proto, trait);
		obj.a.should.equal("aaa");
		obj.b.should.equal("bbb");
	});

	it("client obj dose not have required property should throw a error", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		(function() {
			Trait.create(null, TEquality)
		}).should.
		throw ()
	});

	it("client obj do have required property should not throw error", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		(function() {
			Trait.create({
				equals: function(x) {
					return this === x;
				}
			}, TEquality)
		}).should.not.
		throw ()
	});

	it("should be able to compose mutiple traits", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		var TCompare = Trait.trait({
			smaller: function(x) {
				return this < x;
			}
		});

		var obj = Trait.create({
			equals: function(x) {
				return this === x;
			}
		}, Trait.compose(TEquality, TCompare));

		obj.should.have.property("differ");
		obj.should.have.property("smaller");
	});

	it("should throw error when conflict exists", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		var TCompare = Trait.trait({
			smaller: function(x) {
				return this < x;
			},
			differ: function(x) {
				return this !== x;
			}
		});

		(function() {
			Trait.create({
				equals: function(x) {
					return this === x;
				}
			}, Trait.compose(TEquality, TCompare));
		}).should.
		throw ()
	});

	it("should be able to resolve conflicts by changing name", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		var TCompare = Trait.trait({
			smaller: function(x) {
				return this < x;
			},
			differ: function(x) {
				return this !== x;
			}
		});

		var obj = Trait.create({
			equals: function(x) {
				return this === x;
			}
		}, Trait.compose(TEquality, Trait.resolve({
			differ: "anotherDiffer"
		}, TCompare)));

		obj.should.have.property("differ");
		obj.should.have.property("smaller");
		obj.should.have.property("anotherDiffer");
	});

	it("should be able to resolve conflicts by removing conflicted property", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		var TCompare = Trait.trait({
			smaller: function(x) {
				return this < x;
			},
			differ: function(x) {
				return this !== x;
			}
		});

		var obj = Trait.create({
			equals: function(x) {
				return this === x;
			}
		}, Trait.compose(TEquality, Trait.resolve({
			differ: undefined
		}, TCompare)));

		obj.should.have.property("differ");
		obj.should.have.property("smaller");
	});

	it("should be able to resolve conflicts by override conflicted property", function() {
		var TEquality = Trait.trait({
			equals: Trait.required,
			differ: function(x) {
				return !this.equals(x);
			}
		});

		var TCompare = Trait.trait({
			smaller: function(x) {
				return this < x;
			},
			differ: function(x) {
				return this !== x;
			}
		});

		var obj = Trait.create({
			equals: function(x) {
				return this === x;
			}
		}, Trait.override(TEquality, TCompare));

		obj.should.have.property("differ");
		obj.should.have.property("smaller");
	});
});