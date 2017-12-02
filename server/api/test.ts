import {Context, Request, Response} from 'koa';

import * as ThenFail from '../libs/thenfail';
import {api} from '../apiRouter';

// import {Validator} from '../libs/utils';
// import {APIError, APIErrorCode} from '../modules/core/api-error';

export default class API {
    /**
     * POST /api/test1
     */
    @api({
        // 添加 API 相关配置
        method: 'get'
    })
    static test1(ctx:Context): ThenFail<any> | any {
        return 3;
    }
}

