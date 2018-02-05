var https = require("https");
var http = require("http");
var querystring = require("querystring");

var debug = require("debug")("universal-analytics");

module.exports = send;

function send(queue, options, thisArg, fn) {
  var count = 0;

  var transport = options.https ? https : http;
  var hostname = options.hostname || 'www.google-analytics.com';
  var batching = 'enableBatching' in options ? options.enableBatching : true;
  var batchSize = options.batchSize || 10;

  debug("Sending %d tracking call(s)", queue.length);

  function onFinish(err) {
    debug("Finished sending tracking calls", err || '');
    if (fn) {
      fn.call(thisArg, err || null, count);
    }
  }

  function onResponse(res) {
    var err = res.statusCode;
    if (err < 200 && err >= 300) {
      return onFinish(err);
    }
    iterator();
  }

  function iterator() {
    if (!queue.length) {
      return onFinish(null);
    }
    var body, path;
    var len = batching ? Math.min(queue.length, batchSize) : 1;

    if(len > 1) {
      body = queue.splice(0, len).join('\n');
      path = '/batch';
    } else {
      body = queue.shift();
      path = '/collect';
    }

    count += 1;
    debug("%d: %o", count, body);

    var opts = Object.assign({}, options.requestOptions, {
      method: 'POST',
      hostname: hostname,
      path: path,
      headers: options.headers || {}
    });

    var req = transport.request(opts);
    req.on('response', onResponse);
    req.write(body);
    req.end();
  }

  queue = queue.map(function(x) { return querystring.stringify(x); });
  iterator();
}
