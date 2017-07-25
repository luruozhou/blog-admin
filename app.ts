import * as koa from 'koa';
let app = new koa();

app.use((ctx)=> {
    ctx.body = 'kkk111';
});

app.listen(3000,()=>{
    console.log('listening on port 3000.')
});