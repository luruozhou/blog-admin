import {Context, Request, Response} from 'koa';

import {api} from '../apiRouter';

// import {Validator} from '../libs/utils';
// import {APIError, APIErrorCode} from '../modules/core/api-error';

export default class API {
    /**
     * POST /api/test1
     */
    @api({
        // 添加 API 相关配置
        method: 'get',
        path: /\/(\d+)/
    })
    static async test1(ctx: Context): Promise<any> {
        let query = ctx.query;
        return query.name;
    }
}

