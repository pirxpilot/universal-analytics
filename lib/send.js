var request = require("request");
var querystring = require("querystring");
var config = require("./config");

var debug = require("debug")("universal-analytics");

module.exports = send;

function getBody(params) {
  return params.map(function(x) { return querystring.stringify(x); }).join("\n");
}

function send(queue, options, thisArg, fn) {
  var count = 1;
  fn = fn || function () {};
  debug("Sending %d tracking call(s)", queue.length);

  function onFinish(err) {
    debug("Finished sending tracking calls");
    fn.call(thisArg, err || null, count - 1);
  }

  function iterator() {
    if (!queue.length) {
      return onFinish(null);
    }
    var params = [];

    if(config.batching) {
      params = queue.splice(0, Math.min(queue.length, config.batchSize));
    } else {
      params.push(queue.shift());
    }

    var useBatchPath = params.length > 1;

    var path = config.hostname + (useBatchPath ? config.batchPath :config.path);

    debug("%d: %o", count++, params);

    var opts = Object.assign({}, options.requestOptions, {
      body: getBody(params),
      headers: options.headers || {}
    });

    request.post(path, opts, nextIteration);
  }

  function nextIteration(err) {
    if (err) return onFinish(err);
    iterator();
  }

  iterator();
}
