import * as koa from 'koa';
let app = new koa();

app.use((ctx)=> {
    let k:string =123;
    ctx.body = k;
});

app.listen(3000,()=>{
    console.log('listening on port 3000.')
});