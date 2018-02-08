const https = require('https');
const { stringify } = require('querystring');
const { mapLimit } = require('async');
const inGroupsOf = require('@pirxpilot/in-groups-of');

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
    batchSize = 20,
    headers = {}
  } = options;
  const requestOptions = Object.assign({
    method: 'POST',
    hostname,
    headers
  }, options.requestOptions);

  debug('Sending %d tracking call(s)', queue.length);

  function sendHits(hits, fn) {

    function onResponse(res) {
      count += 1;
      let { statusCode } = res;
      debug('Response from google %d', statusCode);
      if (statusCode < 200 && statusCode >= 300) {
        return fn(statusCode);
      }
      if (options.validateHits) {
        handleResponse(res);
      }
      fn();
    }


    let body = hits.join('\n');
    let path = hits.length > 1 ? '/batch' : '/collect';
    if (options.validateHits) {
      path = '/debug' + path;
    }

    debug('Sending: %o', body);

    let opts = Object.assign({}, requestOptions, { path });
    let req = https.request(opts);
    req.on('response', onResponse);
    req.write(body);
    req.end();
  }

  let groups = inGroupsOf(queue.map(x => stringify(x)), batchSize);
  mapLimit(groups, 5, sendHits, function(err) {
    debug('Finished sending tracking calls', err || '');
    if (fn) {
      fn.call(thisArg, err, count);
    }
  });
}
