"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/helper.ts
var _libcurl = require('@tocha688/libcurl');

// src/type/index.ts
var _lodash = require('lodash'); var _lodash2 = _interopRequireDefault(_lodash);

// src/type/header.ts
var HttpHeaders = class _HttpHeaders {
  constructor(headers) {
    this.headers = /* @__PURE__ */ new Map();
    // 需要保持小写的特殊请求头
    this.lowercaseHeaders = /* @__PURE__ */ new Set([
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
      "sec-fetch-site",
      "sec-fetch-mode",
      "sec-fetch-dest",
      "sec-fetch-user"
    ]);
    if (!headers) return;
    if (headers instanceof _HttpHeaders) {
      this.headers = new Map(headers.headers);
      return;
    }
    if (typeof headers === "string") {
      headers.split("\r\n").forEach((header) => {
        const colonIndex = header.indexOf(":");
        if (colonIndex > 0) {
          const key = header.substring(0, colonIndex);
          const value = header.substring(colonIndex + 1).trim();
          this.set(key, value);
        }
      });
      return;
    }
    Object.entries(headers).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
  get status() {
    const num = _optionalChain([this, 'access', _3 => _3.head, 'optionalAccess', _4 => _4.match, 'call', _5 => _5(/(?<=HTTP\/[\d\.]+\s+)(\d+)/)]);
    return num ? parseInt(num[0]) : 0;
  }
  // 将请求头转换为合适的格式
  normalizeKey(key) {
    const lowerKey = key.toLowerCase();
    if (this.lowercaseHeaders.has(lowerKey)) {
      return lowerKey;
    }
    return lowerKey.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-");
  }
  set(key, value) {
    const normalizedKey = this.normalizeKey(key);
    if (value instanceof Array) {
      return this.headers.set(normalizedKey, value);
    }
    const arr = this.get(key) || [];
    arr.push(value);
    this.headers.set(normalizedKey, arr);
  }
  get(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.headers.get(normalizedKey) || null;
  }
  first(key) {
    return _optionalChain([this, 'access', _6 => _6.get, 'call', _7 => _7(key), 'optionalAccess', _8 => _8[0]]);
  }
  delete(key) {
    const normalizedKey = this.normalizeKey(key);
    this.headers.delete(normalizedKey);
  }
  has(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.headers.has(normalizedKey);
  }
  all() {
    return Object.fromEntries(this.headers);
  }
  toObject() {
    const obj = {};
    this.headers.forEach((values, key) => {
      obj[key] = values[0];
    });
    return obj;
  }
  toArray() {
    const arr = [];
    this.headers.forEach((values, key) => {
      arr.push(`${key}: ${values[0]}`);
    });
    return arr;
  }
  toString() {
    return Array.from(this.headers.entries()).map(([key, values]) => values.map((value) => `${key}: ${value}`).join("\r\n")).flat().join("\r\n");
  }
  clone() {
    const newHeaders = new _HttpHeaders();
    this.headers.forEach((values, key) => {
      newHeaders.headers.set(key, [...values]);
    });
    return newHeaders;
  }
};

// src/type/response.ts
var CurlResponse = class {
  constructor(opts) {
    this.stacks = [];
    this.index = 0;
    this.redirects = 0;
    this.url = _nullishCoalesce(_nullishCoalesce(opts.url, () => ( _optionalChain([opts, 'access', _9 => _9.request, 'optionalAccess', _10 => _10.url]))), () => ( ""));
    this.request = opts.request;
    this.status = opts.headers.status;
    this.dataRaw = opts.dataRaw;
    this.headers = opts.headers;
    this.stacks = opts.stacks || [];
    this.options = opts.options;
    this.index = _nullishCoalesce(opts.index, () => ( 0));
    this.curl = opts.curl;
  }
  get text() {
    return _optionalChain([this, 'access', _11 => _11.dataRaw, 'optionalAccess', _12 => _12.toString, 'call', _13 => _13("utf-8")]);
  }
  get data() {
    if (!this.text) return;
    try {
      return JSON.parse(this.text);
    } catch (e) {
      return this.text;
    }
  }
  get jar() {
    return this.request.jar;
  }
};

// src/type/index.ts
var defaultRequestOption = {
  method: "GET",
  timeout: 3e4,
  allowRedirects: true,
  maxRedirects: 5,
  verify: true,
  acceptEncoding: "gzip, deflate, br, zstd",
  // impersonate: "chrome136",
  // maxRecvSpeed: 0,
  ipType: "auto",
  defaultHeaders: true,
  maxRecvSpeed: 0
};
var defaultInitOptions = _lodash2.default.omit(defaultRequestOption, ["method", "url", "params", "data"]);

// src/app.ts
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var globalLibsPath = _path2.default.join(__dirname, "..", "libs");
var certPath = _path2.default.join(globalLibsPath, "cacert.pem");
function getDirName() {
  const archMap = {
    "x64": "x86_64",
    "arm64": _os2.default.platform() == "linux" ? "aarch64" : "arm64",
    "arm": "arm-linux-gnueabihf",
    "riscv64": "riscv64",
    "i386": "i386",
    "ia32": "i686"
  };
  const platformMap = {
    "linux": "linux-gnu",
    "darwin": "macos",
    "win32": "win32"
  };
  const arch = archMap[_os2.default.arch()] || _os2.default.arch();
  const platform = platformMap[_os2.default.platform()] || _os2.default.platform();
  return `${arch}-${platform}`;
}
function getLibPath() {
  const name = getDirName();
  const libs = {
    "win32": ["bin/libcurl.dll"],
    "darwin": ["libcurl-impersonate.4.dylib", "libcurl-impersonate.dylib"],
    "linux": ["libcurl-impersonate.so"]
  };
  const candidates = libs[_os2.default.platform()] || [];
  if (!_fs2.default.existsSync(globalLibsPath)) {
    throw new Error(`Global libs directory not found: ${globalLibsPath}. Please run scripts/install.cjs first.`);
  }
  let preferredVersion = null;
  try {
    const cfg = __require(_path2.default.join(__dirname, "..", "libcurl.config.json"));
    preferredVersion = _nullishCoalesce(_optionalChain([cfg, 'optionalAccess', _14 => _14.version]), () => ( null));
  } catch (e2) {
  }
  const dirs = _fs2.default.readdirSync(globalLibsPath, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name.startsWith(name + "_"));
  if (preferredVersion) {
    const expectDir = `${name}_${preferredVersion}`;
    const hit = dirs.find((d) => d.name === expectDir);
    if (!hit) {
      throw new Error(`Configured version='${preferredVersion}' in libcurl.config.json not found under ${globalLibsPath}. Please run scripts/install.cjs to download this version.`);
    }
    for (const lib of candidates) {
      const p = _path2.default.join(globalLibsPath, hit.name, lib);
      if (_fs2.default.existsSync(p)) return p;
    }
    throw new Error(`Lib file not found in ${_path2.default.join(globalLibsPath, hit.name)} for platform ${_os2.default.platform()}.`);
  }
  function parseVer(s) {
    const part = s.substring(s.indexOf("_") + 1).replace(/^v/i, "");
    return part.split(".").map((x) => parseInt(x, 10) || 0);
  }
  function cmpDesc(a, b) {
    const va = parseVer(a), vb = parseVer(b);
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      const ai = va[i] || 0, bi = vb[i] || 0;
      if (ai !== bi) return bi - ai;
    }
    return 0;
  }
  const sorted = dirs.map((d) => d.name).sort(cmpDesc);
  for (const dn of sorted) {
    for (const lib of candidates) {
      const p = _path2.default.join(globalLibsPath, dn, lib);
      if (_fs2.default.existsSync(p)) return p;
    }
  }
  throw new Error(`libcurl not found under ${globalLibsPath}; please run scripts/install.cjs.`);
}

// src/utils.ts
var _toughcookie = require('tough-cookie');

function buildUrl(baseUrl, params) {
  if (!params) return baseUrl;
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}
function parseResponseHeaders(str) {
  const headers = [];
  let ch = new HttpHeaders();
  for (const line of str.split("\r\n")) {
    if (!line) continue;
    if (line.startsWith("HTTP/")) {
      ch = new HttpHeaders();
      ch.head = line.trim();
      headers.push(ch);
      continue;
    }
    if (line.includes(":")) {
      const [key, ...vals] = line.split(":");
      ch.set(key, vals.join(":").trim());
    }
  }
  return headers;
}
function normalize_http_version(version) {
  if (typeof version === "number") {
    return version;
  } else if (version === "v1") {
    return _libcurl.CurlHttpVersion.V1_1;
  } else if (version === "v2") {
    return _libcurl.CurlHttpVersion.V2_0;
  } else if (version === "v3") {
    return _libcurl.CurlHttpVersion.V3;
  } else if (version === "v3only") {
    return _libcurl.CurlHttpVersion.V3Only;
  } else if (version === "v2tls") {
    return _libcurl.CurlHttpVersion.V2Tls;
  } else if (version === "v2_prior_knowledge") {
    return _libcurl.CurlHttpVersion.V2PriorKnowledge;
  }
  return version;
}

// src/helper.ts

function setRequestOptions(curl, opts, isCors = false) {
  opts = { ...defaultRequestOption, ...opts };
  const currentUrl = buildUrl(opts.url, opts.params);
  const method = _optionalChain([opts, 'access', _15 => _15.method, 'optionalAccess', _16 => _16.toLocaleUpperCase, 'call', _17 => _17()]) || "GET";
  if (method == "POST") {
    curl.setOption(_libcurl.CurlOpt.Post, 1);
  } else if (method !== "GET") {
    curl.setOption(_libcurl.CurlOpt.CustomRequest, method);
  }
  if (method == "HEAD") {
    curl.setOption(_libcurl.CurlOpt.Nobody, 1);
  }
  curl.setOption(_libcurl.CurlOpt.Url, currentUrl);
  let body = opts.data;
  const headers = new HttpHeaders(opts.headers);
  let contentType = headers.first("Content-Type");
  if (opts.data && typeof opts.data === "object") {
    if (opts.data instanceof URLSearchParams) {
      body = opts.data.toString();
      if (contentType) {
        contentType = "application/x-www-form-urlencoded";
      }
    } else if (Buffer.isBuffer(opts.data)) {
      body = opts.data;
      if (contentType) {
        contentType = "application/octet-stream";
      }
    } else {
      body = JSON.stringify(opts.data);
      if (contentType) {
        contentType = "application/json";
      }
    }
  } else if (typeof opts.data === "string") {
    body = opts.data;
  } else {
    body = "";
  }
  if (body || ["POST", "PUT", "PATCH"].includes(method)) {
    curl.setBody(body);
    if (method == "GET") {
      curl.setOption(_libcurl.CurlOpt.CustomRequest, method);
    }
  }
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  headers.delete("Expect");
  curl.setHeadersRaw(headers.toArray());
  curl.setOption(_libcurl.CurlOpt.CookieFile, "");
  curl.setOption(_libcurl.CurlOpt.CookieList, "ALL");
  const cookieHeader = headers.first("cookie");
  if (cookieHeader || opts.jar) {
    const cookies = /* @__PURE__ */ new Map();
    if (cookieHeader) {
      if (cookieHeader) {
        cookieHeader.split(";").forEach((cookie) => {
          if (!_optionalChain([cookie, 'optionalAccess', _18 => _18.trim, 'call', _19 => _19()])) return;
          const [key, value] = cookie.split("=");
          cookies.set(key.trim(), (_nullishCoalesce(value, () => ( ""))).trim());
        });
      }
    }
    if (opts.jar) {
      const cookieJar = opts.jar;
      const jarCookies = cookieJar.getCookiesSync(currentUrl);
      if (jarCookies.length > 0) {
        jarCookies.forEach((cookie) => {
          cookies.set(cookie.key, cookie.value);
        });
      }
    }
    if (cookies.size > 0) {
      const cookieStr = Array.from(cookies.entries()).map(([key, value]) => `${key}=${value}`).join("; ");
      curl.setCookies(cookieStr);
    }
  }
  if (opts.auth) {
    const { username, password } = opts.auth;
    curl.setOption(_libcurl.CurlOpt.Username, username);
    curl.setOption(_libcurl.CurlOpt.Password, password);
  }
  opts.timeout = _nullishCoalesce(opts.timeout, () => ( 0));
  if (opts.timeout && opts.timeout > 0) {
    curl.setOption(_libcurl.CurlOpt.TimeoutMs, opts.timeout);
  }
  curl.setOption(_libcurl.CurlOpt.FollowLocation, _nullishCoalesce(opts.allowRedirects, () => ( true)));
  curl.setOption(_libcurl.CurlOpt.MaxRedirs, _nullishCoalesce(opts.maxRedirects, () => ( 30)));
  if (opts.proxy) {
    const proxy = new URL(opts.proxy);
    curl.setOption(_libcurl.CurlOpt.Proxy, proxy.protocol + "//" + proxy.host);
    if (!proxy.protocol.startsWith("socks")) {
      curl.setOption(_libcurl.CurlOpt.HttpProxyTunnel, true);
    }
    if (proxy.username && proxy.password) {
      curl.setOption(_libcurl.CurlOpt.ProxyUsername, proxy.username);
      curl.setOption(_libcurl.CurlOpt.ProxyPassword, proxy.password);
    }
  }
  if (opts.verify === false) {
    curl.setOption(_libcurl.CurlOpt.SslVerifyPeer, 0);
    curl.setOption(_libcurl.CurlOpt.SslVerifyHost, 0);
  } else {
    curl.setOption(_libcurl.CurlOpt.SslVerifyPeer, 1);
    curl.setOption(_libcurl.CurlOpt.SslVerifyHost, 2);
    curl.setOption(_libcurl.CurlOpt.CaInfo, certPath);
    curl.setOption(_libcurl.CurlOpt.ProxyCaInfo, certPath);
  }
  if (opts.impersonate) {
    curl.impersonate(opts.impersonate, _nullishCoalesce(opts.defaultHeaders, () => ( true)));
  }
  if (opts.referer) {
    curl.setOption(_libcurl.CurlOpt.Referer, opts.referer);
  }
  if (opts.acceptEncoding) {
    curl.setOption(_libcurl.CurlOpt.AcceptEncoding, opts.acceptEncoding);
  }
  if (typeof opts.cert === "string") {
    curl.setOption(_libcurl.CurlOpt.SslCert, opts.cert);
  } else if (!!opts.cert) {
    !!_optionalChain([opts, 'access', _20 => _20.cert, 'optionalAccess', _21 => _21.cert]) && curl.setOption(_libcurl.CurlOpt.SslCert, opts.cert.cert);
    !!_optionalChain([opts, 'access', _22 => _22.cert, 'optionalAccess', _23 => _23.key]) && curl.setOption(_libcurl.CurlOpt.SslKey, opts.cert.key);
  }
  if (!opts.impersonate && !opts.httpVersion) {
    curl.setOption(_libcurl.CurlOpt.HttpVersion, normalize_http_version("v2"));
  } else if (!opts.impersonate && opts.httpVersion) {
    curl.setOption(_libcurl.CurlOpt.HttpVersion, normalize_http_version(opts.httpVersion));
  }
  if (opts.interface) {
    curl.setOption(_libcurl.CurlOpt.Interface, opts.interface);
  }
  if (opts.ipType) {
    switch (opts.ipType) {
      case "ipv4":
        curl.setOption(_libcurl.CurlOpt.IpResolve, 1);
        break;
      case "ipv6":
        curl.setOption(_libcurl.CurlOpt.IpResolve, 2);
        break;
      case "auto":
        curl.setOption(_libcurl.CurlOpt.IpResolve, 0);
        break;
    }
  }
  if (opts.keepAlive === false && isCors === false) {
    curl.setOption(_libcurl.CurlOpt.TcpKeepAlive, 0);
    curl.setOption(_libcurl.CurlOpt.FreshConnect, 1);
  }
  if (opts.dev) {
    curl.setOption(_libcurl.CurlOpt.Verbose, 1);
  }
  curl.setOption(_libcurl.CurlOpt.MaxRecvSpeedLarge, _nullishCoalesce(opts.maxRecvSpeed, () => ( 0)));
  if (opts.curlOptions) {
    if (!!_optionalChain([opts, 'optionalAccess', _24 => _24.curlOptions])) {
      for (const [key, value] of Object.entries(opts.curlOptions)) {
        let ekey = key;
        if (typeof value === "string") {
          curl.setOption(ekey, value);
        } else if (typeof value === "number") {
          curl.setOption(ekey, value);
        } else if (typeof value === "boolean") {
          curl.setOption(ekey, value);
        }
      }
    }
  }
}
function parseResponse(curl, req) {
  const dataRaw = curl.getRespBody();
  const headerRaw = curl.getRespHeaders().toString("utf-8");
  const stacks = [];
  const hds = parseResponseHeaders(headerRaw);
  const jar = req.jar;
  let nextReq = _lodash2.default.clone(req);
  hds.forEach((header, i) => {
    const treq = _lodash2.default.clone(nextReq);
    const res = new CurlResponse({
      url: treq.url,
      headers: header,
      request: treq,
      options: req,
      stacks,
      index: stacks.length,
      curl
    });
    res.redirects = Math.max(0, stacks.length - 1);
    treq.response = res;
    let loction = res.headers.first("location");
    if (loction) {
      nextReq.url = new URL(loction, treq.url).toString();
      nextReq.method = "GET";
      nextReq.data = void 0;
    } else {
      res.dataRaw = dataRaw;
    }
    if (jar) {
      _optionalChain([res, 'access', _25 => _25.headers, 'access', _26 => _26.get, 'call', _27 => _27("set-cookie"), 'optionalAccess', _28 => _28.forEach, 'call', _29 => _29((cookie) => {
        jar.setCookieSync(cookie, treq.url);
      })]);
    }
    stacks.push(treq);
  });
  return stacks[Math.max(stacks.length - 1, 0)].response;
}

// src/impl/request_sync.ts
function requestSync(options, curl) {
  try {
    curl.performSync();
    return parseResponse(curl, options);
  } finally {
  }
}
async function request(options, curl) {
  try {
    await curl.perform();
    return parseResponse(curl, options);
  } finally {
  }
}











exports.HttpHeaders = HttpHeaders; exports.CurlResponse = CurlResponse; exports.defaultRequestOption = defaultRequestOption; exports.defaultInitOptions = defaultInitOptions; exports.getLibPath = getLibPath; exports.setRequestOptions = setRequestOptions; exports.parseResponse = parseResponse; exports.requestSync = requestSync; exports.request = request;
