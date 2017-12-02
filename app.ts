import * as Koa from 'koa';
import * as Path from 'path';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
// import {router} from './routes';
import {APIRouter} from './server/apiRouter';

const app = new Koa();

const router = new Router();
new APIRouter(router, '/api', Path.join(process.cwd(), './dest/server/api'));

app.use(bodyParser());
app.use(router.routes());
app.listen(3000, () => {
    console.log('>>| Listen on 3000');
});