import * as koa from 'koa';
let app = new koa();
function log(thing) {
    console.log('thing', thing)
}
app.use((ctx)=> {
    let k:string ='';
    ctx.body = k;
});

app.listen(3000,()=>{
    console.log('listening on port 3000.')
});