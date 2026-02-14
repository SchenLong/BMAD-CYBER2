/**
 * Global Type Declarations for Express and Related Middleware
 */

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    params: Record<string, string>;
    query: Record<string, any>;
    body: any;
    headers: Record<string, string>;
    ip?: string;
    path?: string;
    method?: string;
    originalUrl?: string;
    url?: string;
    connection?: {
      remoteAddress?: string;
    };
  }

  export interface Response extends ServerResponse {
    status(code: number): Response;
    json(data: any): Response;
    send(data: any): Response;
    set(field: string, value: string): Response;
    get(header: string): string | undefined;
    req: Request;
    statusCode: number;
    headersSent: boolean;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Router {
    use(...handlers: any[]): Router;
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
    patch(path: string, ...handlers: any[]): Router;
  }

  export interface Application {
    use(...handlers: any[]): Application;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
    put(path: string, ...handlers: any[]): Application;
    delete(path: string, ...handlers: any[]): Application;
    patch(path: string, ...handlers: any[]): Application;
    listen(port: number, hostname: string, callback: () => void): any;
    set(key: string, value: any): Application;
    engine(name: string, fn: any): Application;
    static(root: string): any;
  }

  export const express: {
    (): Application;
    static: (root: string) => any;
    Router: () => Router;
  };
  export default express;
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  export function cors(options?: any): RequestHandler;
  export default cors;
}

declare module 'helmet' {
  import { RequestHandler } from 'express';
  export function helmet(options?: any): RequestHandler;
  export default helmet;
}

declare module 'compression' {
  import { Request, Response, NextFunction } from 'express';
  export function compression(options?: any): any;
  export default compression;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  export function rateLimit(options?: any): RequestHandler;
  export default rateLimit;
}

declare module 'rate-limiter-flexible' {
  export class RateLimiterRedis {
    constructor(options: any);
    consume(key: string): Promise<void>;
  }
}

declare module 'express-validator' {
  import { Request } from 'express';
  export class Result {
    isEmpty(): boolean;
    array(): any[];
  }
  export function validationResult(req: Request): Result;
  export function body(field: string): any;
  export function query(field: string): any;
  export function param(field: string): any;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  export const serve: RequestHandler;
  export function setup(swaggerDoc: any, options?: any): RequestHandler;
}

declare module 'express-openapi-validator' {
  export class OpenApiValidator {
    constructor(options: any);
    install(app: any): Promise<void>;
  }
}

declare module 'http-proxy-middleware' {
  import { RequestHandler } from 'express';
  export interface Options {
    target: string;
    changeOrigin?: boolean;
    timeout?: number;
    pathRewrite?: Record<string, string>;
    onProxyReq?: (proxyReq: any, req: any, res: any) => void;
    onProxyRes?: (proxyRes: any, req: any, res: any) => void;
    onError?: (err: any, req: any, res: any) => void;
    router?: (req: any) => string;
  }
  export function createProxyMiddleware(options: Options): RequestHandler;
}

declare module 'ioredis' {
  export class Redis {
    constructor(options: any);
    on(event: string, handler: any): void;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<'OK' | null>;
    setex(key: string, seconds: number, value: string): Promise<'OK' | null>;
    del(...keys: string[]): Promise<number>;
    flushdb(): Promise<'OK'>;
    quit(): Promise<'OK'>;
  }
}

declare module 'lru-cache' {
  export class LRUCache<K, V> {
    constructor(options: any);
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
  }
  export const LRU: typeof LRUCache;
}
