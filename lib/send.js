const https = require('https');
const { stringify } = require('querystring');

const debug = require('debug')('universal-analytics');

module.exports = send;

function handleResponse(res) {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', display);

  function display() {
    try {
      let { hitParsingResult } = JSON.parse(body);
      hitParsingResult = hitParsingResult.filter(r => !r.valid);
      if (!hitParsingResult.length) {
        debug('All hits valid!');
      }
      for (let { hit, parserMessage } of hitParsingResult) {
        debug('Errors for %s - %O', hit, parserMessage);
      }
    } catch (e) {}
  }
}

function send(queue, options, thisArg, fn) {
  let count = 0;

  const {
    hostname = 'www.google-analytics.com',
    batchSize = 10,
    headers = {}
  } = options;
  const requestOptions = Object.assign({
    method: 'POST',
    hostname,
    headers
  }, options.requestOptions);

  debug('Sending %d tracking call(s)', queue.length);

  function onFinish(err) {
    debug('Finished sending tracking calls', err || '');
    if (fn) {
      fn.call(thisArg, err || null, count);
    }
  }

  function onResponse(res) {
    let { statusCode } = res;
    debug('Response from google %d', statusCode);
    if (statusCode < 200 && statusCode >= 300) {
      return onFinish(statusCode);
    }
    if (options.validateHits) {
      handleResponse(res);
    }
    iterator();
  }

  function iterator() {
    if (!queue.length) {
      return onFinish(null);
    }
    let body, path;
    let len = Math.min(queue.length, batchSize);

    if (len > 1) {
      body = queue.splice(0, len).join('\n');
      path = '/batch';
    } else {
      body = queue.shift();
      path = '/collect';
    }
    if (options.validateHits) {
      path = '/debug' + path;
    }

    count += 1;
    debug('%d: %o', count, body);

    let opts = Object.assign({}, requestOptions, { path });
    let req = https.request(opts);
    req.on('response', onResponse);
    req.write(body);
    req.end();
  }

  queue = queue.map(x => stringify(x));
  iterator();
}
