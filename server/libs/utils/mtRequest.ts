import * as ThenFail from '../thenfail';
import * as HttpRequest from 'request';
import * as API from '../../modules/core/api-error';

/**
 * 封装RequestH请求为Promise对象
 */
export class MTRequest {
    constructor(options: {
        token?: string,
        host?: string
    }) {
        this.options = options || {};
        this.token = options.token || '';
        this.host = options.host || '';
    }

    private options: any;
    private token: string;
    private host: string;

    private baseParams(params: any) {
        params = ThenFail.Utils.defaults({}, params);
        if (this.options.token) {
            params.accesstoken = this.options.token;
        }
        return params;
    }

    request(method: string, path: string, params: any): ThenFail<any> {
        let opts: {
            method: string,
            url: string,
            json: boolean,
            qs?: any,
            body?: any,
            timeout?: any,
            headers?: any,
            rejectUnauthorized?: boolean
        } = {
                method: method.toUpperCase(),
                url: this.host + path,
                json: true,
                timeout: 60000,
            };

        if (!/^(?:post|get|put|delete|all)$/i.test(opts.method)) {
            throw new Error(`invalid request method "${method}"`);
        }
        if (opts.method === 'GET' || opts.method === 'HEAD') {
            opts.qs = this.baseParams(params);
        } else {
            opts.body = this.baseParams(params);
        }

        if (this.host && /^https:/.test(this.host.toLocaleLowerCase())) {
            opts.rejectUnauthorized = false;
        }
        return this.fetch(opts);
    }

    requestByForm(method: string, path: string, params: any): ThenFail<any> {
        let opts: {
            method: string,
            url: string,
            timeout?: any,
            form: any,
            rejectUnauthorized?: boolean
        } = {
                method: method.toUpperCase(),
                url: this.host + path,
                timeout: 60000,
                form: params
            };

        if (!/^(?:post|get|put|delete|all)$/i.test(opts.method)) {
            throw new Error(`invalid request method "${method}"`);
        }
        if (this.host && /^https:/.test(this.host.toLocaleLowerCase())) {
            opts.rejectUnauthorized = false;
        }

        return this.fetch(opts);
    }

    fetch(opts: any) {
        return new ThenFail((resolve, reject) => {
            HttpRequest(opts, (err: any, resp: any, body: any) => {
                if (err) {
                    reject(err);
                }
                if (!body && body != 0) {
                    return reject(new API.APIError(API.APIErrorCode.CustomAPIError, 'Not received anything'));
                }
                else {
                    let _data = <any>body;
                    resolve(_data);
                }
            });
        });
    }

}

/**
 * 请求方法
 */
export let Method = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
    ALL: 'ALL'
};