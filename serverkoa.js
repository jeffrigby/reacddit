const serve = require('koa-static');
const Koa = require('koa');

const app = new Koa();

// or use absolute paths
app.use(serve(__dirname + '/dist/'));

app.listen(3000);

console.log('listening on port 3000');
