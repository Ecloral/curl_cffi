import { CurlMulti, Curl, CurlOpt } from '@tocha688/libcurl';
export { Curl, CurlError, CurlHttpVersion, CurlInfo, CurlIpResolve, CurlMOpt, CurlOpt, CurlSslVersion, CurlWsFlag } from '@tocha688/libcurl';
import * as tough_cookie from 'tough-cookie';
import { CookieJar } from 'tough-cookie';

type CURL_IMPERSONATE_EDGE = "edge99" | "edge101";
type CURL_IMPERSONATE_CHROME = "chrome99" | "chrome100" | "chrome101" | "chrome104" | "chrome107" | "chrome110" | "chrome116" | "chrome119" | "chrome120" | "chrome123" | "chrome124" | "chrome131" | "chrome133a" | "chrome136" | "chrome99_android" | "chrome131_android";
type CURL_IMPERSONATE_SAFARI = "safari153" | "safari155" | "safari170" | "safari172_ios" | "safari180" | "safari180_ios" | "safari184" | "safari184_ios" | "safari260" | "safari260_ios";
type CURL_IMPERSONATE_FIREFOX = "firefox133" | "firefox135" | "tor145";
type CURL_IMPERSONATE_DEFAULT = "chrome" | "firefox1" | "safar";
type CURL_IMPERSONATE = CURL_IMPERSONATE_EDGE | CURL_IMPERSONATE_CHROME | CURL_IMPERSONATE_SAFARI | CURL_IMPERSONATE_FIREFOX | CURL_IMPERSONATE_DEFAULT;

type CurlData = {
    curl: Curl;
    options: RequestOptions;
    resolve: (res?: CurlResponse) => void;
    reject: (err?: Error) => void;
};
declare class CurlMultiTimer extends CurlMulti {
    private forceTimeoutTimer;
    private timers;
    curls: Map<string, CurlData>;
    private sockfds;
    constructor();
    /**
     * 设置回调函数
     */
    private setupCallbacks;
    private isRunning;
    private waitResult;
    private processData;
    private isCecker;
    private checkProcess;
    request(ops: RequestOptions, curl: Curl): Promise<any>;
    close(): void;
}

declare class CurlMultiImpl extends CurlMultiTimer {
}

type RequestAuth = {
    username: string;
    password: string;
};
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | string;
type RequestCert = {
    key: string;
    cert: string;
};
type IpType = 'ipv4' | 'ipv6' | 'auto';
type HttpVersion = "v1" | "v2" | "v3" | "v3only" | "v2tls" | "v2_prior_knowledge";
type RequestOptions = {
    method?: RequestMethod;
    url?: string;
    params?: Record<string, any>;
    data?: Record<string, any> | string | null;
    jar?: CookieJar;
    headers?: Record<string, string>;
    auth?: RequestAuth;
    timeout?: number;
    allowRedirects?: boolean;
    maxRedirects?: number;
    proxy?: string;
    referer?: string;
    acceptEncoding?: string;
    impersonate?: CURL_IMPERSONATE;
    ja3?: string;
    akamai?: string;
    defaultHeaders?: boolean;
    defaultEncoding?: string;
    httpVersion?: HttpVersion | number;
    interface?: string;
    cert?: string | RequestCert;
    verify?: boolean;
    maxRecvSpeed?: number;
    curlOptions?: Record<CurlOpt, string | number | boolean>;
    ipType?: IpType;
    impl?: CurlMultiImpl;
    retryCount?: number;
    keepAlive?: boolean;
    sync?: boolean;
    dev?: boolean;
    cors?: boolean;
};
type RequestInitOptions = Omit<RequestOptions, "method" | "url" | "params" | "data"> & {
    baseUrl?: string;
    params?: Record<string, any>;
    defaultData?: Record<string, any> | string | URLSearchParams | null;
};
type FetchOptions = RequestOptions & {
    body?: string | Record<string, any> | null;
    sync?: boolean;
};
type CurlOptions = RequestOptions & {
    MaxConnects?: number;
    MaxConcurrentStreams?: number;
};
type CurlRequestInfo = RequestOptions & {
    response: CurlResponse;
};
type RequestEvent = (options: RequestOptions) => Promise<RequestOptions>;
type ResponseEvent = (options: CurlResponse) => Promise<CurlResponse>;
interface CurlRequestimpl {
    request(options: RequestOptions): Promise<CurlResponse>;
    get(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    post(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    put(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    delete(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    patch(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    head(url: string, options?: RequestOptions): Promise<CurlResponse>;
    options(url: string, options?: RequestOptions): Promise<CurlResponse>;
}

declare class HttpHeaders {
    head?: string;
    headers: Map<string, string[]>;
    private readonly lowercaseHeaders;
    constructor(headers?: Record<string, string> | HttpHeaders | string);
    get status(): number;
    private normalizeKey;
    set(key: string, value: string | string[]): Map<string, string[]> | undefined;
    get(key: string): string[] | null;
    first(key: string): string | undefined;
    delete(key: string): void;
    has(key: string): boolean;
    all(): {
        [k: string]: string[];
    };
    toObject(): Record<string, string>;
    toArray(): string[];
    toString(): string;
    clone(): HttpHeaders;
}

type CurlResponseOptions = {
    headers: HttpHeaders;
    dataRaw?: Buffer;
    request: CurlRequestInfo;
    url: string;
    stacks?: Array<CurlRequestInfo>;
    options: RequestOptions;
    index?: number;
    curl: Curl;
};
declare class CurlResponse {
    url: string;
    status: number;
    dataRaw?: Buffer;
    headers: HttpHeaders;
    request: CurlRequestInfo;
    options: RequestOptions;
    stacks: Array<CurlRequestInfo>;
    index: number;
    redirects: number;
    curl: Curl;
    constructor(opts: CurlResponseOptions);
    get text(): string | undefined;
    get data(): any;
    get jar(): CookieJar | undefined;
}

declare const defaultRequestOption: Partial<RequestOptions>;
declare const defaultInitOptions: Partial<RequestInitOptions>;

type CurlPoolOptions = {
    maxSize?: number;
    idleTTL?: number;
};
/**
 * CurlPool 管理 Curl 连接的获取与复用：
 * - acquire()：获取一个空闲 Curl，若没有则新建（不超过 maxSize）
 * - release(curl)：释放 Curl，标记为空闲并记录最后使用时间
 * - prune()：清理超过 idleTTL 的空闲连接
 * - close()：关闭池内所有连接
 */
declare class CurlPool {
    private items;
    private readonly maxSize;
    private readonly idleTTL;
    private pruneTimer?;
    constructor(opts?: CurlPoolOptions);
    acquire(): Curl;
    release(curl: Curl): void;
    remove(curl: Curl): void;
    private startPrune;
    prune(): void;
    size(): number;
    close(): void;
}

type RequestData$1 = Record<string, any> | string | URLSearchParams;
/**
 * 提供统一的便捷方法，实现于基类，具体的请求由子类实现。
 * 子类只需实现 request(options) 即可复用 get/post/... 方法。
 */
declare abstract class BaseClient {
    abstract request(options: RequestOptions): Promise<CurlResponse>;
    get(url: string, options?: RequestOptions): Promise<CurlResponse>;
    post(url: string, data?: RequestData$1, options?: RequestOptions): Promise<CurlResponse>;
    put(url: string, data?: RequestData$1, options?: RequestOptions): Promise<CurlResponse>;
    delete(url: string, data?: RequestData$1, options?: RequestOptions): Promise<CurlResponse>;
    patch(url: string, data?: RequestData$1, options?: RequestOptions): Promise<CurlResponse>;
    head(url: string, options?: RequestOptions): Promise<CurlResponse>;
    options(url: string, options?: RequestOptions): Promise<CurlResponse>;
}

type InterceptorOptions<T> = {
    runIf?: (value: T) => boolean;
    priority?: number;
};
type InterceptorHandler<T> = {
    fulfilled?: (value: T) => Promise<T> | T;
    rejected?: (error: any, value?: T) => Promise<T> | T;
    options?: InterceptorOptions<T>;
};
/**
 * 拦截器管理器，支持 axios 风格：
 * - request 拦截器按 LIFO（后加先执行）
 * - response 拦截器按 FIFO（先加先执行）
 * - 支持条件运行（runIf）与优先级（priority）
 */
declare class InterceptorManager<T> {
    private readonly mode;
    private seq;
    private items;
    constructor(mode?: 'request' | 'response');
    use(fulfilled?: (value: T) => Promise<T> | T, rejected?: (error: any, value?: T) => Promise<T> | T, options?: InterceptorOptions<T>): number;
    eject(id: number): void;
    clear(): void;
    list(): Array<[number, InterceptorHandler<T>]>;
    runFulfilled(value: T): Promise<T>;
    runRejected(error: any, value?: T): Promise<T | undefined>;
}

/**
 * 通用请求基类：抽取 CurlRequest/CurlRequestMulti 的重复逻辑。
 * - 统一维护 opts/baseUrl/CurlPool
 * - 统一准备请求参数（默认值合并、URL 拼接）
 * - 统一 CORS 预检、setRequestOptions、重试与资源释放
 * 子类只需实现 send(curl, opts) 来决定具体的发送方式。
 */
declare abstract class RequestClientBase extends BaseClient {
    readonly opts: RequestInitOptions;
    protected readonly baseUrl?: string;
    protected readonly pool: CurlPool;
    readonly interceptors: {
        request: InterceptorManager<RequestOptions>;
        response: InterceptorManager<CurlResponse>;
    };
    constructor(opts?: RequestInitOptions, poolOptions?: CurlPoolOptions);
    protected prepareOptions(options: RequestOptions): RequestOptions;
    protected abstract send(curl: Curl, opts: RequestOptions): Promise<CurlResponse>;
    request(options: RequestOptions): Promise<CurlResponse>;
    get jar(): tough_cookie.CookieJar | undefined;
    get baseURL(): string | undefined;
    close(): void;
    onRequest(event: (options: RequestOptions) => Promise<RequestOptions> | RequestOptions): number;
    onResponse(event: (res: CurlResponse) => Promise<CurlResponse> | CurlResponse): number;
    use(plugin: {
        install(client: RequestClientBase): void;
    }): void;
}

/**
 * 批量请求客户端：基于 CurlMultiImpl（Timer/Event）进行大批量请求。
 * - 使用 CurlPool 为每个请求分配一个 easy Curl handle。
 * - 提供 batch() 批量接口和 request() 单个接口。
 */
declare class CurlRequestMulti extends RequestClientBase {
    private multi?;
    constructor(opts?: RequestInitOptions, poolOptions?: CurlPoolOptions, multi?: CurlMultiImpl);
    private get multiImpl();
    protected send(curl: Curl, opts: RequestOptions): Promise<CurlResponse>;
    /**
     * 批量请求：并发提交到 curl_multi，返回每个请求的 Promise。
     */
    batch(requests: RequestOptions[]): Promise<CurlResponse[]>;
    close(): void;
}

/**
 * 单请求客户端：默认直接使用 Curl.perform/send 发起请求。
 * - 自动缓存 Curl（通过 CurlPool），下次优先复用；如池内都在用则新建 Curl。
 * - 支持 session（通过在 opts 中传入 jar）。
 * - 支持 CORS 预检与重试、请求/响应事件钩子。
 * - 支持 baseUrl，自动拼接相对路径。
 */
declare class CurlRequest extends RequestClientBase {
    constructor(opts?: RequestInitOptions, poolOptions?: CurlPoolOptions);
    protected send(curl: Curl, opts: RequestOptions): Promise<CurlResponse>;
}

declare function fetch(url: string, options?: FetchOptions): Promise<CurlResponse>;

/**
 * 会话客户端：在 baseOptions 中注入 CookieJar，并复用 CurlPool。
 */
declare class CurlSession extends CurlRequest {
    constructor(ops?: RequestInitOptions, poolOptions?: CurlPoolOptions);
}

declare const storageCurls: Set<any>;
declare function getGlobalRequest(): CurlRequestMulti | CurlRequest;

type RequestData = Record<string, any> | string | URLSearchParams;
declare class CurlRequestImplBase {
    baseOptions: RequestOptions;
    constructor(baseOptions?: RequestOptions);
    protected init(): void;
    protected request(options: RequestOptions): Promise<CurlResponse>;
    protected beforeRequest(options: RequestOptions): Promise<CurlResponse>;
    get(url: string, options?: RequestOptions): Promise<CurlResponse>;
    post(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse>;
    put(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse>;
    delete(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse>;
    patch(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse>;
    head(url: string, options?: RequestOptions): Promise<CurlResponse>;
    options(url: string, options?: RequestOptions): Promise<CurlResponse>;
    get jar(): tough_cookie.CookieJar | undefined;
}
declare class CurlClient extends CurlRequestImplBase {
    private multi?;
    constructor(ops?: CurlOptions);
    private reqs;
    private resps;
    private emits;
    onRequest(event: RequestEvent): void;
    onResponse(event: ResponseEvent): void;
    private initOptions;
    protected send(options: RequestOptions, curl: Curl): Promise<CurlResponse>;
    protected getCurl(): Curl;
    protected beforeResponse(options: RequestOptions, curl: Curl, res: CurlResponse): Promise<CurlResponse>;
    request(options: RequestOptions): Promise<CurlResponse>;
    close(): void;
    setImpl(impl?: CurlMultiImpl): void;
    getImpl(): CurlMultiImpl | undefined;
}

declare const req: CurlRequest | CurlRequestMulti;

declare enum LogLevel {
    none = 0,
    error = 1,
    info = 2,
    warn = 3,
    debug = 4
}
declare class Logger {
    static level: LogLevel;
    private constructor();
    private static time;
    static info(...args: any[]): void;
    static debug(...args: any[]): void;
    static warn(...args: any[]): void;
    static error(...args: any[]): void;
}

declare const libVersion: () => string;
declare const libPath: () => string | null;

export { BaseClient, type CURL_IMPERSONATE, type CURL_IMPERSONATE_CHROME, type CURL_IMPERSONATE_DEFAULT, type CURL_IMPERSONATE_EDGE, type CURL_IMPERSONATE_FIREFOX, type CURL_IMPERSONATE_SAFARI, CurlClient, CurlMultiImpl, type CurlOptions, CurlRequest, type CurlRequestInfo, CurlRequestMulti, type CurlRequestimpl, CurlResponse, type CurlResponseOptions, CurlSession, type FetchOptions, HttpHeaders, type HttpVersion, type IpType, LogLevel, Logger, type RequestAuth, type RequestCert, RequestClientBase, type RequestEvent, type RequestInitOptions, type RequestMethod, type RequestOptions, type ResponseEvent, defaultInitOptions, defaultRequestOption, fetch, getGlobalRequest, libPath, libVersion, req, storageCurls };
