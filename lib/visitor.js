const debug = require("debug")("universal-analytics");
const config = require("./config");
const send = require('./send');

const { determineCid, checkParams, tidyParams, translateParams } = require("./utils");

class Visitor {
  constructor(tid, cid, options, context, persistentParams) {

    if (typeof tid === 'object') {
      options = tid;
      tid = cid = null;
    } else if (typeof cid === 'object') {
      options = cid;
      cid = null;
    }

    this._queue = [];

    this.options = options || {};

    this._context = context || {};
    this._persistentParams = persistentParams || {};

    this.tid = tid || this.options.tid;
    this.cid = determineCid(this.options.strictCidFormat != false, cid, this.options.cid);
    if(this.options.uid) {
      this.uid = this.options.uid;
    }
  }

  debug(d) {
    debug.enabled = arguments.length === 0 ? true : d;
    debug("visitor.debug() is deprecated: set DEBUG=universal-analytics to enable logging");
    return this;
  }

  reset() {
    this._context = null;
    return this;
  }

  set(key, value) {
    this._persistentParams = this._persistentParams || {};
    this._persistentParams[key] = value;
    return this;
  }

  pageview(path, hostname, title, params, fn) {

    if (typeof path === 'object' && path != null) {
      params = path;
      if (typeof hostname === 'function') {
        fn = hostname;
      }
      path = hostname = title  = null;
    } else if (typeof hostname === 'function') {
      fn = hostname;
      hostname = title = null;
    } else if (typeof title === 'function') {
      fn = title;
      title = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.dp = path || params.dp || this._context.dp;
    params.dh = hostname || params.dh || this._context.dh;
    params.dt = title || params.dt || this._context.dt;

    tidyParams(params);

    if (!params.dp && !params.dl) {
      return this._handleError("Please provide either a page path (dp) or a document location (dl)", fn);
    }

    return this._withContext(params)._enqueue("pageview", params, fn);
  }

  screenview(screenName, appName, appVersion, appId, appInstallerId, params, fn) {

    if (typeof screenName === 'object' && screenName != null) {
      params = screenName;
      if (typeof appName === 'function') {
        fn = appName;
      }
        screenName = appName = appVersion = appId = appInstallerId = null;
    } else if (typeof appName === 'function') {
      fn = appName;
      appName = appVersion = appId = appInstallerId = null;
    } else if (typeof appVersion === 'function') {
      fn = appVersion;
      appVersion = appId = appInstallerId = null;
    } else if (typeof appId === 'function') {
      fn = appId;
      appId = appInstallerId = null;
    } else if (typeof appInstallerId === 'function') {
      fn = appInstallerId;
      appInstallerId = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.cd = screenName || params.cd || this._context.cd;
    params.an = appName || params.an || this._context.an;
    params.av = appVersion || params.av || this._context.av;
    params.aid = appId || params.aid || this._context.aid;
    params.aiid = appInstallerId || params.aiid || this._context.aiid;

    tidyParams(params);

    if (!params.cd || !params.an) {
        return this._handleError("Please provide at least a screen name (cd) and an app name (an)", fn);
    }

    return this._withContext(params)._enqueue("screenview", params, fn);
  }

  event(category, action, label, value, params, fn) {

    if (typeof category === 'object' && category != null) {
      params = category;
      if (typeof action === 'function') {
        fn = action;
      }
      category = action = label = value = null;
    } else if (typeof label === 'function') {
      fn = label;
      label = value = null;
    } else if (typeof value === 'function') {
      fn = value;
      value = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.ec = category || params.ec || this._context.ec;
    params.ea = action || params.ea || this._context.ea;
    params.el = label || params.el || this._context.el;
    params.ev = value || params.ev || this._context.ev;
    params.dp = params.dp || this._context.dp;

    tidyParams(params);

    if (!params.ec || !params.ea){      return this._handleError("Please provide at least an event category (ec) and an event action (ea)", fn);
    }

    return this._withContext(params)._enqueue("event", params, fn);
  }

  transaction(transaction, revenue, shipping, tax, affiliation, params, fn) {
    if (typeof transaction === 'object') {
      params = transaction;
      if (typeof revenue === 'function') {
        fn = revenue;
      }
      transaction = revenue = shipping = tax = affiliation = null;
    } else if (typeof revenue === 'function') {
      fn = revenue;
      revenue = shipping = tax = affiliation = null;
    } else if (typeof shipping === 'function') {
      fn = shipping;
      shipping = tax = affiliation = null;
    } else if (typeof tax === 'function') {
      fn = tax;
      tax = affiliation = null;
    } else if (typeof affiliation === 'function') {
      fn = affiliation;
      affiliation = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.ti = transaction || params.ti || this._context.ti;
    params.tr = revenue || params.tr || this._context.tr;
    params.ts = shipping || params.ts || this._context.ts;
    params.tt = tax || params.tt || this._context.tt;
    params.ta = affiliation || params.ta || this._context.ta;
    params.dp = params.dp || this._context.dp;

    tidyParams(params);

    if (!params.ti) {
      return this._handleError("Please provide at least a transaction ID (ti)", fn);
    }

    return this._withContext(params)._enqueue("transaction", params, fn);
  }

  item(price, quantity, sku, name, variation, params, fn) {
    if (typeof price === 'object') {
      params = price;
      if (typeof quantity === 'function') {
        fn = quantity;
      }
      price = quantity = sku = name = variation = null;
    } else if (typeof quantity === 'function') {
      fn = quantity;
      quantity = sku = name = variation = null;
    } else if (typeof sku === 'function') {
      fn = sku;
      sku = name = variation = null;
    } else if (typeof name === 'function') {
      fn = name;
      name = variation = null;
    } else if (typeof variation === 'function') {
      fn = variation;
      variation = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.ip = price || params.ip || this._context.ip;
    params.iq = quantity || params.iq || this._context.iq;
    params.ic = sku || params.ic || this._context.ic;
    params.in = name || params.in || this._context.in;
    params.iv = variation || params.iv || this._context.iv;
    params.dp = params.dp || this._context.dp;
    params.ti = params.ti || this._context.ti;

    tidyParams(params);

    if (!params.ti) {
      return this._handleError("Please provide at least an item transaction ID (ti)", fn);
    }

    return this._withContext(params)._enqueue("item", params, fn);

  }

  exception(description, fatal, params, fn) {

    if (typeof description === 'object') {
      params = description;
      if (typeof fatal === 'function') {
        fn = fatal;
      }
      description = fatal = null;
    } else if (typeof fatal === 'function') {
      fn = fatal;
      fatal = 0;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.exd = description || params.exd || this._context.exd;
    params.exf = +!!(fatal || params.exf || this._context.exf);

    if (params.exf === 0) {
      delete params.exf;
    }

    tidyParams(params);

    return this._withContext(params)._enqueue("exception", params, fn);
  }

  timing(category, variable, time, label, params, fn) {

    if (typeof category === 'object') {
      params = category;
      if (typeof variable === 'function') {
        fn = variable;
      }
      category = variable = time = label = null;
    } else if (typeof variable === 'function') {
      fn = variable;
      variable = time = label = null;
    } else if (typeof time === 'function') {
      fn = time;
      time = label = null;
    } else if (typeof label === 'function') {
      fn = label;
      label = null;
    } else if (typeof params === 'function') {
      fn = params;
      params = null;
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);

    params.utc = category || params.utc || this._context.utc;
    params.utv = variable || params.utv || this._context.utv;
    params.utt = time || params.utt || this._context.utt;
    params.utl = label || params.utl || this._context.utl;

    tidyParams(params);

    return this._withContext(params)._enqueue("timing", params, fn);
  }

  append(type, params, fn) {
    if (!this.options.skipParamsTranslation) {
      params = translateParams(params);
    }

    params = Object.assign({}, this._persistentParams, params);
    return this._enqueue(type, params, fn);
  }

  send(fn) {
    send(this._queue, this.options, this, fn);
    this._queue = [];
  }

  _enqueue(type, params, fn) {

    if (typeof params === 'function') {
      fn = params;
      params = {};
    }

    if (!this.options.skipParamsTranslation) {
      params = translateParams(params) || {};
    }

    Object.assign(params, {
      v: config.protocolVersion,
      tid: this.tid,
      cid: this.cid,
      t: type
    });
    if (this.uid) {
      params.uid = this.uid;
    }

    this._queue.push(params);

    if (debug.enabled) {
      checkParams(params);
    }

    debug("Enqueued %s (%o)", type, params);

    if (fn) {
      this.send(fn);
    }

    return this;
  }

  _handleError(message, fn) {
    debug("Error: %s", message);
    if (fn) {
      fn.call(this, new Error(message));
    }
    return this;
  }

  _withContext(context) {
    let visitor = new Visitor(this.tid, this.cid, this.options, context, this._persistentParams);
    visitor._queue = this._queue;
    return visitor;
  }
}

Visitor.prototype.pv = Visitor.prototype.pageview;
Visitor.prototype.e = Visitor.prototype.event;
Visitor.prototype.t = Visitor.prototype.transaction;
Visitor.prototype.i = Visitor.prototype.item;

module.exports = Visitor;
