const Visitor = require('./lib/visitor');
const middleware = require('./lib/middleware');

module.exports = init;

function init (tid, cid, options) {
  return new Visitor(tid, cid, options);
}

init.Visitor = Visitor;
init.middleware = middleware;
