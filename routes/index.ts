import * as Router from 'koa-router';
import * as moment from "moment";

const router = new Router();


router.get('/test', (ctx) => {
    ctx.body = moment().format('YYYY-MM-DD hh:mm:ss')
})
export {router}