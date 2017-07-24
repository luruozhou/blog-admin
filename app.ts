import * as koa from 'koa';
let app = new koa();


app.use((ctx)=> {
    ctx.body = 'Hello World';
});

app.listen(3000);