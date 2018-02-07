
var nock = require("nock");

var ua = require("..");

/* global describe, it */

describe("ua", function () {

	describe("#send", function () {

		it("should immidiately return with an empty queue", function (done) {
			var visitor = ua();

			visitor.send(function(err, count) {
        count.should.eql(0);
        done(err);
      });

		});

		it("should include data in POST body", function (done) {
      nock('https://www.google-analytics.com')
        .post('/collect', 'first=124')
        .reply(204);

			var visitor = ua();
			visitor._queue.push({ first: 124 });
			visitor.send(function(err, count) {
        count.should.eql(1);
        done(err);
      });
		});

		it("should send individual requests when batchSize is 1", function(done) {
      nock('https://www.google-analytics.com')
        .post('/collect', 'first=124')
        .reply(204)
        .post('/collect', 'second=abc')
        .reply(204)
        .post('/collect', 'third=false')
        .reply(204);

			var paramSets = [
				{ first: 124 },
				{ second: 'abc' },
				{ third: false }
			];

			var visitor = ua({ batchSize: 1 });
			visitor._queue.push.apply(visitor._queue, paramSets);
			visitor.send(function(err, count) {
        count.should.eql(3);
        done(err);
      });
		});

		describe("#batching is true", function() {

			it("should send request to collect path when only one payload", function(done) {
        nock('https://www.google-analytics.com')
          .post('/collect', 'first=1234')
          .reply(204);

				var paramSets = [
					{ first: 1234 }
				];

				var visitor = ua({enableBatching:true});
				visitor._queue.push.apply(visitor._queue, paramSets);
				visitor.send(function(err, count) {
          count.should.eql(1);
          done(err);
        });
			});

			it("should send request to batch path when more than one payload sent", function(done) {
        nock('https://www.google-analytics.com')
          .post('/batch', 'first=123\nsecond=abc\nthird=false')
          .reply(204);

        var paramSets = [
          { first: 123 },
          { second: 'abc' },
          { third: false }
        ];

				var visitor = ua({enableBatching:true});
				visitor._queue.push.apply(visitor._queue, paramSets);
				visitor.send(function(err, count) {
          count.should.eql(1);
          done(err);
        });
			});

			it("should batch data based on batchSize", function(done) {
        nock('https://www.google-analytics.com')
          .post('/batch', 'first=123\nsecond=abc')
          .reply(204)
          .post('/collect', 'third=false')
          .reply(204);

        var paramSets = [
          { first: 123 },
          { second: 'abc' },
          { third: false }
        ];

				var visitor = ua({enableBatching:true, batchSize: 2});
				visitor._queue.push.apply(visitor._queue, paramSets);
				visitor.send(function(err, count) {
          count.should.eql(2);
          done(err);
        });
			});

		});

		it("should add custom headers to request header", function (done) {
      nock('https://www.google-analytics.com')
        .matchHeader('User-Agent', 'Test User Agent')
        .post('/collect', '')
        .reply(204);

			var visitor = ua({
				headers: {'User-Agent': 'Test User Agent'}
			});
			visitor._queue.push({});
			visitor.send(done);
		});

	});

});
