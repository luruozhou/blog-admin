import * as Koa from 'koa';
import * as Path from 'path';
import * as bodyParser from 'koa-bodyparser';
import * as Router from 'koa-router';
import * as views from 'koa-views';
import * as json from 'koa-json';
import * as logger from 'koa-logger';
import * as staticPath from 'koa-static';

import {APIRouter} from './server/apiRouter';

const app = new Koa();


const router = new Router();
new APIRouter(router, '/api', Path.join(process.cwd(), './dest/server/api'), Path.join(process.cwd(), './dest/server/test-data'));

app.use(views(Path.join(__dirname, '..', '/views'), {
    extension: 'tpl',
    map: {
        tpl: 'swig'
    }
}))

app.use(json());
app.use(logger());
app.use(bodyParser());

//
app.use(staticPath(Path.join(__dirname, '..', '/public')))

app.use(router.routes());

app.listen(3000, () => {
    console.log('>>| Listen on 3000');
});