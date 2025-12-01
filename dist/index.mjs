import {
  CurlResponse,
  HttpHeaders,
  defaultInitOptions,
  defaultRequestOption,
  getLibPath,
  parseResponse,
  request,
  requestSync,
  setRequestOptions
} from "./chunk-SPGYR3GU.mjs";

// src/index.ts
import { getLibPath as getLibPathBase, getVersion } from "@tocha688/libcurl";
import { CurlMOpt as CurlMOpt2, CurlHttpVersion, CurlOpt, CurlError, CurlInfo as CurlInfo2, CurlIpResolve, CurlSslVersion, CurlWsFlag, Curl as Curl5 } from "@tocha688/libcurl";

// src/request/global.ts
import { globalCleanup } from "@tocha688/libcurl";

// src/impl/index.ts
import { setLibPath } from "@tocha688/libcurl";

// src/impl/curl_multi_timer.ts
import { CurlMulti, CurlInfo } from "@tocha688/libcurl";

// src/logger.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["none"] = 0] = "none";
  LogLevel2[LogLevel2["error"] = 1] = "error";
  LogLevel2[LogLevel2["info"] = 2] = "info";
  LogLevel2[LogLevel2["warn"] = 3] = "warn";
  LogLevel2[LogLevel2["debug"] = 4] = "debug";
  return LogLevel2;
})(LogLevel || {});
var Logger = class {
  constructor() {
  }
  static time() {
    return (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").replace("Z", "");
  }
  static info(...args) {
    if (this.level >= 2 /* info */) {
      console.log(this.time(), ...args);
    }
  }
  static debug(...args) {
    if (this.level >= 4 /* debug */) {
      console.log(this.time(), ...args);
    }
  }
  static warn(...args) {
    if (this.level >= 3 /* warn */) {
      console.warn(this.time(), ...args);
    }
  }
  static error(...args) {
    if (this.level >= 1 /* error */) {
      console.log(this.time(), ...args);
    }
  }
};
Logger.level = 2 /* info */;

// src/impl/curl_multi_timer.ts
var CURLMSG_DONE = 1;
var CurlMultiTimer = class extends CurlMulti {
  constructor() {
    super();
    this.forceTimeoutTimer = null;
    this.timers = [];
    this.curls = /* @__PURE__ */ new Map();
    this.sockfds = /* @__PURE__ */ new Set();
    this.isRunning = false;
    this.isCecker = false;
    this.setupCallbacks();
    storageCurls.add(this);
  }
  /**
   * 设置回调函数
   */
  setupCallbacks() {
    Logger.debug("setupCallbacks - setTimerCallback");
    this.setTimerCallback((err, args) => {
      if (err) {
        Logger.error(err);
        return;
      }
      if (args.timeoutMs == -1) {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers = [];
        this.checkProcess();
      } else {
        this.timers.push(setTimeout(() => {
          Logger.debug("CurlMultiTimer - setTimerCallback - timeout", args.timeoutMs);
          this.processData();
        }, args.timeoutMs));
      }
    });
  }
  async waitResult() {
    if (this.isRunning) return;
    this.isRunning = true;
    return await Promise.resolve().then(async () => {
      do {
        await this.wait(1e4);
        await this.processData();
      } while (this.curls.size > 0);
    });
  }
  processData() {
    if (this.closed) return;
    try {
      const runSize = this.perform();
      if (runSize <= 0) {
        if (this.curls.size > 0) {
        }
        return;
      } else {
        this.checkProcess();
      }
    } catch (error) {
      Logger.error("CurlMultiTimer - error", error);
    }
  }
  checkProcess() {
    if (this.isCecker) return;
    try {
      while (true) {
        const msg = this.infoRead();
        if (!msg) {
          break;
        }
        Logger.warn(`CurlMultiTimer - Message`, msg);
        if (msg.msg === CURLMSG_DONE) {
          const call = this.curls.get(msg.easyId);
          if (!call || !msg.data) continue;
          this.curls.delete(msg.easyId);
          this.removeHandle(call.curl);
          if (msg.data.result == 0) {
            Logger.debug(`CurlMultiTimer - getInfoNumber - start`, msg.easyId);
            const status = call.curl.getInfoNumber(CurlInfo.ResponseCode) || 200;
            Logger.debug(`CurlMultiTimer - getInfoNumber - end`, msg.easyId);
            if (status < 100) {
              call.reject(new Error(call.curl.error(status)));
            } else {
              call.resolve(parseResponse(call.curl, call.options));
            }
          } else {
            call.reject(new Error(call.curl.error(msg.data.result)));
          }
          Logger.debug(`CurlMultiTimer - checkProcess - DONE`);
          Logger.debug(`CurlMultiTimer - checkProcess - DONE OK`);
        } else {
          Logger.warn(`CurlMultiTimer - checkProcess - NOT DONE`, msg);
        }
      }
    } catch (e) {
      Logger.error("\u5904\u7406\u5B8C\u6210\u6D88\u606F\u65F6\u51FA\u9519", e);
    } finally {
      this.isCecker = false;
    }
  }
  async request(ops, curl) {
    return new Promise((resolve, reject) => {
      this.curls.set(curl.id(), {
        options: ops,
        curl,
        resolve,
        reject
      });
      Logger.debug(`CurlMultiTimer - request - addHandle start`);
      this.addHandle(curl);
      Logger.debug(`CurlMultiTimer - request - addHandle end`);
      this.waitResult();
      setImmediate(() => {
        if (!this.closed) {
          this.processData();
        }
      });
    });
  }
  close() {
    storageCurls.delete(this);
    if (this.closed) return;
    Logger.debug(`CurlMultiTimer - close start`);
    if (this.forceTimeoutTimer) {
      clearInterval(this.forceTimeoutTimer);
      this.forceTimeoutTimer = null;
    }
    super.close();
    this.sockfds.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
    this.curls.forEach((call) => {
      call.reject(new Error("CurlPools is closed"));
    });
    this.curls.clear();
  }
};

// src/impl/index.ts
var CurlMultiImpl = class extends CurlMultiTimer {
};
function curlGlobalInit() {
  setLibPath(getLibPath());
}

// src/request/CurlRequestMulti.ts
import _3 from "lodash";

// src/request/RequestClientBase.ts
import _2 from "lodash";

// src/core/CurlPool.ts
import { Curl as Curl2 } from "@tocha688/libcurl";
var CurlPool = class {
  constructor(opts = {}) {
    this.items = [];
    this.maxSize = opts.maxSize ?? Number.POSITIVE_INFINITY;
    this.idleTTL = opts.idleTTL ?? 6e4;
    this.startPrune();
    storageCurls.add(this);
  }
  acquire() {
    const idle = this.items.find((it) => !it.busy);
    if (idle) {
      idle.busy = true;
      return idle.curl;
    }
    if (this.items.length < this.maxSize) {
      const curl = new Curl2();
      const item = { curl, busy: true, lastUsed: Date.now() };
      this.items.push(item);
      return curl;
    }
    return new Curl2();
  }
  release(curl) {
    const it = this.items.find((x) => x.curl === curl);
    if (!it) {
      try {
        curl.close();
      } catch {
      }
      return;
    }
    it.busy = false;
    it.lastUsed = Date.now();
  }
  remove(curl) {
    if (!curl.closed) {
      curl.close();
    }
    const index = this.items.findIndex((x) => x.curl === curl);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
  startPrune() {
    this.pruneTimer && clearInterval(this.pruneTimer);
    this.pruneTimer = setInterval(() => this.prune(), Math.min(this.idleTTL, 6e4));
    this.pruneTimer.unref();
  }
  prune() {
    const now = Date.now();
    const remain = [];
    for (const it of this.items) {
      if (!it.busy && now - it.lastUsed > this.idleTTL) {
        try {
          it.curl.close();
        } catch {
        }
      } else {
        remain.push(it);
      }
    }
    this.items = remain;
  }
  size() {
    return this.items.length;
  }
  close() {
    this.pruneTimer && clearInterval(this.pruneTimer);
    this.pruneTimer = void 0;
    for (const it of this.items) {
      try {
        it.curl.close();
      } catch {
      }
    }
    this.items = [];
  }
};

// src/request/BaseClient.ts
var BaseClient = class {
  get(url, options) {
    return this.request({ ...options, url, method: "GET" });
  }
  post(url, data, options) {
    return this.request({ ...options, url, method: "POST", data });
  }
  put(url, data, options) {
    return this.request({ ...options, url, method: "PUT", data });
  }
  delete(url, data, options) {
    return this.request({ ...options, url, method: "DELETE", data });
  }
  patch(url, data, options) {
    return this.request({ ...options, url, method: "PATCH", data });
  }
  head(url, options) {
    return this.request({ ...options, url, method: "HEAD" });
  }
  options(url, options) {
    return this.request({ ...options, url, method: "OPTIONS" });
  }
};

// src/request/shared.ts
import _ from "lodash";
function mergeDefaultParamsAndData(baseInit, opts) {
  const merged = { ...opts };
  const urlParamsObj = {};
  if (merged.url) {
    try {
      if (/^https?:\/\//.test(merged.url)) {
        const u = new URL(merged.url);
        u.searchParams.forEach((v, k) => {
          urlParamsObj[k] = v;
        });
      } else if (baseInit.baseUrl) {
        const base = baseInit.baseUrl.endsWith("/") ? baseInit.baseUrl : baseInit.baseUrl + "/";
        const path = merged.url.startsWith("/") ? merged.url.slice(1) : merged.url;
        const u = new URL(path, base);
        u.searchParams.forEach((v, k) => {
          urlParamsObj[k] = v;
        });
      } else if (merged.url.includes("?")) {
        const q = merged.url.substring(merged.url.indexOf("?") + 1);
        const usp = new URLSearchParams(q);
        usp.forEach((v, k) => {
          urlParamsObj[k] = v;
        });
      }
    } catch {
    }
  }
  const initParams = baseInit.params;
  const reqParams = merged.params;
  if (initParams || reqParams || Object.keys(urlParamsObj).length > 0) {
    merged.params = _.merge({}, initParams || {}, urlParamsObj, reqParams || {});
  }
  const defaultData = baseInit.defaultData;
  if (defaultData !== void 0 && defaultData !== null) {
    const reqData = merged.data;
    const isDefaultObj = _.isPlainObject(defaultData);
    const isReqObj = _.isPlainObject(reqData);
    const isDefaultQS = defaultData instanceof URLSearchParams;
    const isReqQS = reqData instanceof URLSearchParams;
    if (reqData === void 0 || reqData === null) {
      merged.data = defaultData;
    } else if (isDefaultObj && isReqObj) {
      merged.data = _.merge({}, defaultData, reqData);
    } else if (isDefaultQS && isReqQS) {
      const mergedQS = new URLSearchParams(defaultData);
      for (const [k, v] of reqData.entries()) {
        mergedQS.set(k, v);
      }
      merged.data = mergedQS;
    }
  }
  return merged;
}
function resolveUrlWithBase(baseUrl, url) {
  if (!url) return url;
  if (!baseUrl || /^https?:\/\//.test(url)) return url;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}
async function corsPreflightIfNeeded(curl, opts) {
  if (!opts.cors) return;
  const corsOpts = _.merge({}, opts, {
    method: "OPTIONS",
    data: null,
    body: null,
    headers: { "Content-Type": null }
  });
  await setRequestOptions(curl, corsOpts);
  if (opts.sync) {
    const { requestSync: requestSync2 } = await import("./request_sync-NLH5EWIM.mjs");
    await requestSync2(corsOpts, curl);
  } else {
    const { request: request2 } = await import("./request_sync-NLH5EWIM.mjs");
    await request2(corsOpts, curl);
  }
}
async function withRetry(retryCount, attempt) {
  let left = retryCount ?? 0;
  let lastError;
  do {
    try {
      return await attempt();
    } catch (e) {
      lastError = e;
      if (left <= 0) throw e;
    }
  } while (left-- > 0);
  throw lastError;
}

// src/request/interceptors.ts
var InterceptorManager = class {
  constructor(mode = "response") {
    this.mode = mode;
    this.seq = 1;
    this.items = /* @__PURE__ */ new Map();
  }
  use(fulfilled, rejected, options) {
    const id = this.seq++;
    this.items.set(id, { fulfilled, rejected, options });
    return id;
  }
  eject(id) {
    this.items.delete(id);
  }
  clear() {
    this.items.clear();
  }
  list() {
    const list = Array.from(this.items.entries());
    list.sort((a, b) => (b[1].options?.priority ?? 0) - (a[1].options?.priority ?? 0));
    if (this.mode === "request") list.reverse();
    return list;
  }
  async runFulfilled(value) {
    let v = value;
    const list = this.list();
    for (const [, h] of list) {
      if (h.fulfilled && (!h.options?.runIf || h.options.runIf(v))) {
        v = await h.fulfilled(v);
      }
    }
    return v;
  }
  async runRejected(error, value) {
    let v = value;
    let err = error;
    const list = this.list();
    let handled = false;
    for (const [, h] of list) {
      if (h.rejected) {
        const maybe = await h.rejected(err, v);
        if (maybe !== void 0) {
          v = maybe;
          handled = true;
          break;
        }
      }
    }
    return handled ? v : void 0;
  }
};

// src/request/RequestClientBase.ts
var RequestClientBase = class extends BaseClient {
  constructor(opts = _2.clone(defaultInitOptions), poolOptions = {}) {
    super();
    this.interceptors = {
      request: new InterceptorManager("request"),
      response: new InterceptorManager("response")
    };
    this.opts = _2.merge({}, defaultInitOptions, opts);
    this.baseUrl = opts.baseUrl;
    this.pool = new CurlPool(poolOptions);
  }
  prepareOptions(options) {
    const { baseUrl: _ignoredBaseUrl, ...reqOptions } = options ?? {};
    let opts = _2.merge({}, this.opts, reqOptions);
    opts = mergeDefaultParamsAndData(this.opts, opts);
    if (opts.url) {
      opts.url = resolveUrlWithBase(this.baseUrl, opts.url);
    }
    return opts;
  }
  async request(options) {
    const curl = this.pool.acquire();
    let opts = this.prepareOptions(options);
    try {
      try {
        opts = await this.interceptors.request.runFulfilled(opts);
      } catch (err) {
        const recovered = await this.interceptors.request.runRejected(err, opts);
        if (recovered !== void 0) opts = recovered;
        else throw err;
      }
      await corsPreflightIfNeeded(curl, opts);
      let res;
      try {
        res = await withRetry(opts.retryCount ?? 0, async () => {
          curl.reset();
          await setRequestOptions(curl, opts);
          return await this.send(curl, opts);
        });
      } catch (err) {
        const recovered = await this.interceptors.response.runRejected(err);
        if (recovered !== void 0) return recovered;
        throw err;
      }
      try {
        return await this.interceptors.response.runFulfilled(res);
      } catch (err) {
        const recovered = await this.interceptors.response.runRejected(err, res);
        if (recovered !== void 0) return recovered;
        throw err;
      }
    } finally {
      if (options.keepAlive === false) {
        this.pool.remove(curl);
      } else {
        this.pool.release(curl);
      }
    }
  }
  get jar() {
    return this.opts.jar;
  }
  get baseURL() {
    return this.baseUrl;
  }
  close() {
    this.pool.close();
  }
  // 兼容旧的事件注册 API：仅注册 fulfilled 拦截器
  onRequest(event) {
    return this.interceptors.request.use(event);
  }
  onResponse(event) {
    return this.interceptors.response.use(event);
  }
  // 插件系统：插件通过 install(this) 注册其拦截器或其它行为
  use(plugin) {
    plugin.install(this);
  }
};

// src/request/CurlRequestMulti.ts
var CurlRequestMulti = class extends RequestClientBase {
  constructor(opts = _3.clone(defaultInitOptions), poolOptions = {}, multi) {
    super(opts, poolOptions);
    this.multi = multi;
  }
  get multiImpl() {
    if (!this.multi) {
      this.multi = new CurlMultiImpl();
    }
    return this.multi;
  }
  async send(curl, opts) {
    return await this.multiImpl.request(opts, curl);
  }
  /**
   * 批量请求：并发提交到 curl_multi，返回每个请求的 Promise。
   */
  batch(requests) {
    const tasks = requests.map((r) => this.request(r));
    return Promise.all(tasks);
  }
  // 便捷方法由 BaseClient 统一提供
  close() {
    this.multi?.close();
    super.close();
  }
};

// src/request/global.ts
curlGlobalInit();
var storageCurls = global.__Tocha_CurlStorage = global.__Tocha_CurlStorage ?? /* @__PURE__ */ new Set();
var _req;
function getGlobalRequest() {
  if (!_req) {
    _req = new CurlRequestMulti();
    storageCurls.add(_req);
  }
  return _req;
}
var cleaned = false;
var cleanup = () => {
  if (cleaned) return;
  cleaned = true;
  try {
    storageCurls.forEach((item) => {
      try {
        item.close();
      } catch {
      }
    });
    globalCleanup();
  } catch {
  }
};
process.on("beforeExit", cleanup);

// src/request/request.ts
import { Curl as Curl3 } from "@tocha688/libcurl";
async function fetch(url, options = {}) {
  options.url = url;
  options.data = options.body;
  let curl = new Curl3();
  setRequestOptions(curl, options);
  if (options.sync) {
    return await requestSync(options, curl);
  }
  return await request(options, curl);
}

// src/request/session.ts
import { CookieJar } from "tough-cookie";

// src/request/CurlRequest.ts
import _4 from "lodash";
var CurlRequest = class extends RequestClientBase {
  constructor(opts = _4.clone(defaultInitOptions), poolOptions = {}) {
    super(opts, poolOptions);
  }
  async send(curl, opts) {
    return await (opts.sync ? requestSync(opts, curl) : request(opts, curl));
  }
  // 便捷方法由 BaseClient 统一提供
  // 便捷 getter 与关闭操作由基类提供
};

// src/request/session.ts
var CurlSession = class extends CurlRequest {
  constructor(ops, poolOptions) {
    super({
      ...ops,
      jar: ops?.jar ?? new CookieJar()
    }, poolOptions);
  }
};

// src/request/client.ts
import { Curl as Curl4, CurlMOpt } from "@tocha688/libcurl";
import _5 from "lodash";
var CurlRequestImplBase = class {
  constructor(baseOptions = _5.clone(defaultRequestOption)) {
    this.baseOptions = baseOptions;
    this.init();
  }
  init() {
  }
  request(options) {
    throw new Error("Method not implemented.");
  }
  async beforeRequest(options) {
    return this.request(options);
  }
  get(url, options) {
    return this.beforeRequest({
      url,
      method: "GET",
      ...options
    });
  }
  post(url, data, options) {
    return this.beforeRequest({
      url,
      method: "POST",
      data,
      ...options
    });
  }
  put(url, data, options) {
    return this.beforeRequest({
      url,
      method: "PUT",
      data,
      ...options
    });
  }
  delete(url, data, options) {
    return this.beforeRequest({
      url,
      method: "DELETE",
      data,
      ...options
    });
  }
  patch(url, data, options) {
    return this.beforeRequest({
      url,
      method: "PATCH",
      data,
      ...options
    });
  }
  head(url, options) {
    return this.beforeRequest({
      url,
      method: "HEAD",
      ...options
    });
  }
  options(url, options) {
    return this.beforeRequest({
      url,
      method: "OPTIONS",
      ...options
    });
  }
  get jar() {
    return this.baseOptions.jar;
  }
};
var CurlClient = class extends CurlRequestImplBase {
  constructor(ops) {
    super(ops);
    this.reqs = [];
    this.resps = [];
    ops = _5.merge({}, defaultRequestOption, ops);
    this.multi = ops?.impl;
    this.initOptions(ops);
  }
  async emits(options, calls) {
    for (const call of calls) {
      options = await call(options);
    }
    return options;
  }
  onRequest(event) {
    if (this.reqs.indexOf(event) === -1) {
      this.reqs.push(event);
    }
  }
  onResponse(event) {
    if (this.resps.indexOf(event) === -1) {
      this.resps.push(event);
    }
  }
  initOptions(ops) {
    if (!ops) return;
    if (!this.multi) return;
    if (ops.keepAlive == false) {
      this.multi.setOption(CurlMOpt.Pipelining, 1);
    } else {
      this.multi.setOption(CurlMOpt.Pipelining, 2);
    }
    this.multi.setOption(CurlMOpt.Pipelining, 2);
    this.multi.setOption(CurlMOpt.MaxConnects, ops.MaxConnects ?? 10);
    this.multi.setOption(CurlMOpt.MaxConcurrentStreams, ops.MaxConcurrentStreams ?? 500);
  }
  async send(options, curl) {
    if (this.multi) {
      return await this.multi.request(options, curl);
    } else if (options.sync) {
      return await requestSync(options, curl);
    } else {
      return await request(options, curl);
    }
  }
  getCurl() {
    return new Curl4();
  }
  async beforeResponse(options, curl, res) {
    curl.close();
    return res;
  }
  async request(options) {
    let curl = this.getCurl();
    const opts = _5.merge({}, this.baseOptions, options);
    if (opts.cors) {
      const corsOpts = _5.merge({}, opts, {
        method: "OPTIONS",
        data: null,
        body: null,
        headers: {
          "Content-Type": null
        }
      });
      await setRequestOptions(curl, corsOpts);
      await this.send(corsOpts, curl);
    }
    let retryCount = opts?.retryCount ?? 0;
    let result;
    do {
      try {
        curl.reset();
        await setRequestOptions(curl, opts);
        await this.emits(opts, this.reqs);
        result = await this.send(opts, curl);
        break;
      } catch (e) {
        if (retryCount <= 0) {
          throw e;
        }
        console.warn(`Request failed, retrying... (${retryCount} retries left)`, e);
      }
    } while (retryCount-- > 0);
    await this.emits(result, this.resps);
    return this.beforeResponse(opts, curl, result);
  }
  close() {
    this.multi?.close();
  }
  setImpl(impl) {
    this.multi = impl;
  }
  getImpl() {
    return this.multi;
  }
};

// src/request/index.ts
var req = getGlobalRequest();

// src/index.ts
var libVersion = () => getVersion();
var libPath = () => getLibPathBase();
export {
  BaseClient,
  Curl5 as Curl,
  CurlClient,
  CurlError,
  CurlHttpVersion,
  CurlInfo2 as CurlInfo,
  CurlIpResolve,
  CurlMOpt2 as CurlMOpt,
  CurlMultiImpl,
  CurlOpt,
  CurlRequest,
  CurlRequestMulti,
  CurlResponse,
  CurlSession,
  CurlSslVersion,
  CurlWsFlag,
  HttpHeaders,
  LogLevel,
  Logger,
  RequestClientBase,
  defaultInitOptions,
  defaultRequestOption,
  fetch,
  getGlobalRequest,
  libPath,
  libVersion,
  req,
  storageCurls
};
