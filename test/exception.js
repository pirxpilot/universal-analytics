
var sinon = require("sinon");

var ua = require("../lib/index.js");

/* global describe, it, beforeEach, afterEach */

describe("ua", function () {


	describe("#exception", function () {
		var _enqueue;

		beforeEach(function () {
			_enqueue = sinon.stub(ua.Visitor.prototype, "_enqueue", function () {
				if (arguments.length === 3 && typeof arguments[2] === 'function') {
					arguments[2]();
				}
				return this;
			});
		});

		afterEach(function () {
			_enqueue.restore();
		});


		it("should accept arguments (description)", function () {
			var description = Math.random().toString();

			var visitor = ua();

			var result = visitor.exception(description);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd");
			_enqueue.args[0][1].exd.should.equal(description);
		});


		it("should accept arguments (description, fn)", function () {
			var description = Math.random().toString();
			var fn = sinon.spy();

			ua().exception(description, fn);

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd");
			_enqueue.args[0][1].exd.should.equal(description);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});


		it("should accept arguments (description, fatal)", function () {
			var description = Math.random().toString();
			var fatal = true;

			var visitor = ua();

			var result = visitor.exception(description, fatal);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd", "exf");
			_enqueue.args[0][1].exd.should.equal(description);
			_enqueue.args[0][1].exf.should.equal(1);
		});


		it("should accept arguments (description, fatal, fn)", function () {
			var description = Math.random().toString();
			var fatal = true;
			var fn = sinon.spy();

			var visitor = ua();

			var result = visitor.exception(description, fatal, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd", "exf");
			_enqueue.args[0][1].exd.should.equal(description);
			_enqueue.args[0][1].exf.should.equal(1);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});


		it("should accept arguments (description, fatal, params)", function () {
			var description = Math.random().toString();
			var fatal = true;
			var params = {"p": "/" + Math.random()};

			var visitor = ua();

			var result = visitor.exception(description, fatal, params);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd", "exf", "p");
			_enqueue.args[0][1].exd.should.equal(description);
			_enqueue.args[0][1].exf.should.equal(1);
			_enqueue.args[0][1].p.should.equal(params.p);
		});


		it("should accept arguments (description, fatal, params, fn)", function () {
			var description = Math.random().toString();
			var fatal = true;
			var params = {"p": "/" + Math.random()};
			var fn = sinon.spy();

			var visitor = ua();

			var result = visitor.exception(description, fatal, params, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd", "exf", "p");
			_enqueue.args[0][1].exd.should.equal(description);
			_enqueue.args[0][1].exf.should.equal(1);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});


		it("should accept arguments (params)", function () {
			var params = {
				exd: Math.random().toString(),
				exf: true,
				p: "/" + Math.random()
			};

			var visitor = ua();

			var result = visitor.exception(params);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
			_enqueue.args[0][1].should.have.keys("exd", "exf", "p");
			_enqueue.args[0][1].exd.should.equal(params.exd);
			_enqueue.args[0][1].exf.should.equal(1);
			_enqueue.args[0][1].p.should.equal(params.p);
		});


		it("should accept arguments (params, fn)", function () {
			var params = {
				exd: Math.random().toString(),
				exf: false,
				p: "/" + Math.random()
			};
			var fn = sinon.spy();

			var visitor = ua();

			var result = visitor.exception(params, fn);

			visitor._context = result._context;
			result.should.eql(visitor, "should return a visitor that is identical except for the context");

			result.should.be.instanceof(ua.Visitor);
			result._context.should.eql(_enqueue.args[0][1], "the pageview params should be persisted as the context of the visitor clone");

			_enqueue.calledOnce.should.equal(true, "#_enqueue should have been called once");
			_enqueue.args[0][0].should.equal("exception");
      _enqueue.args[0][1].should.have.keys("exd", "p");
			_enqueue.args[0][1].should.not.have.keys("exf");
			_enqueue.args[0][1].exd.should.equal(params.exd);
			_enqueue.args[0][1].p.should.equal(params.p);

			fn.calledOnce.should.equal(true, "callback should have been called once");
		});

	});

});










