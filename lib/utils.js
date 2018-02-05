const uuid = require("uuid");
const debug = require("debug")("universal-analytics");

const config = require("./config");

module.exports = {
  determineCid,
  tidyParams,
  checkParams,
  translateParams,
  isUuid
};

function tidyParams(params) {
  if (!params) {
    return;
  }
  for (let [param, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      delete params[param];
    }
  }
}

function checkParams(params) {
  function testRe(r) {
    let param = this;
    return r.test(param);
  }

  for (let param of Object.keys(params)) {
    if (config.acceptedParameters.includes(param) || config.acceptedParametersRegex.some(testRe, param)) {
      continue;
    }
    debug("Warning! Unsupported tracking parameter %s (%s)", param, params[param]);
  }
}

function determineCid(strict, ...cids) {
  if (strict) {
    for (let cid of cids) {
      let id = ensureValidCid(cid);
      if (id !== false) return id;
      if (id != null) debug("Warning! Invalid UUID format '%s'", cid);
    }
  } else {
    for (let cid of cids) {
      if (cid) return cid;
    }
  }
  return uuid.v4();
}

function translateParams(params) {
  if (!params) {
    return params;
  }
  let translated = {};
  for (let [key, value] of Object.entries(params)) {
    if (config.parametersMap.hasOwnProperty(key)) {
      translated[config.parametersMap[key]] = value;
    } else {
      translated[key] = value;
    }
  }
  return translated;
}

function isUuid(uuid) {
  if (!uuid) return false;
  uuid = uuid.toString();
  return /[0-9a-f]{8}\-?[0-9a-f]{4}\-?4[0-9a-f]{3}\-?[89ab][0-9a-f]{3}\-?[0-9a-f]{12}/i.test(uuid);
}

function isCookieCid(cid) {
  return /^[0-9]+\.[0-9]+$/.test(cid);
}

function ensureValidCid(uuid) {
  if (!isUuid(uuid)) {
    if (!isCookieCid(uuid)) {
      return false;
    }
    return uuid;
  }

  uuid = uuid.replace(/\-/g, "");
  return "" +
    uuid.substring(0, 8) + "-" +
    uuid.substring(8, 12) + "-" +
    uuid.substring(12, 16) + "-" +
    uuid.substring(16, 20) + "-" +
    uuid.substring(20);
}
