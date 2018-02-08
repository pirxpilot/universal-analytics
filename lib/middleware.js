const Visitor = require('./visitor');

module.exports = middleware;

function createFromSession(session) {
  if (session && session.cid) {
    return new Visitor(this.tid, session.cid, this.options);
  }
}

function middleware(tid, options) {
  let self = this;

  self.tid = tid;
  self.options = options;
  self.createFromSession = createFromSession;

  let { cookieName = "_ga" } = self.options || {};

  return function (req, res, next) {

    req.visitor = self.createFromSession(req.session);

    if (req.visitor) return next();

    let cid;
    if (req.cookies && req.cookies[cookieName]) {
      let gaSplit = req.cookies[cookieName].split('.');
      cid = gaSplit[2] + "." + gaSplit[3];
    }

    req.visitor = new Visitor(tid, cid, options);

    if (req.session) {
      req.session.cid = req.visitor.cid;
    }

    next();
  };
}
