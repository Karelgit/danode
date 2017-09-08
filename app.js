const phantom = require('phantom');
const fs = require('fs');
const Koa = require('koa');
const path = require('path')
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const static = require('koa-static');

const app = new Koa();

var title;

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'

app.use(static(
    path.join( __dirname,  staticPath)
))

app.use(async(ctx, next) => {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
    await next();
});


router.post('/load', async (ctx) => {
    var
        postUrl = ctx.request.body.postUrl;
        postMd5 = ctx.request.body.postMd5;
        var imgname = postMd5+'.png';

    const instance = await phantom.create(['--ignore-ssl-errors=yes']);
    const page = await instance.createPage();
    page.property('viewportSize',{ width: 1024, height : 800 });
    page.property('clipRect',{  top: 0, left: 0, width: 1024, height: 800 });
    page.setting('javascriptEnabled',false);
    // page.setting('userAgent','Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36');
    page.setting('resourceTimeout',5000);

    //资源请求普通处理
    await page.on('onResourceRequested', function(requestData) {
        console.info('Requesting', requestData.url);
    });

   const timeout = await page.on('onResourceTimeout', function(request) {
        console.info('timeout: '+request.url);
    });

    //open函数简单处理
    const status = await page.open(postUrl);
    console.info('status: '+ status);

    const title = await page.invokeMethod('evaluate', function() {
        return document.title;
    });
    console.info('title: '+title);

    const resultOfRender = await page.render(`static/${imgname}`);
    await instance.exit();

    if(status ==='fail')  {
        ctx.response.append('title',null);
        ctx.response.body = {"result":false,"msg":"下载失败"};
        ctx.response.status = 404;
    }else  {

        ctx.response.append('title',null);
        ctx.response.body = await fs.readFileSync(`static/${imgname}`);
    }
});

app.use(bodyParser());
app.use(router.routes());

app.listen(3002);
console.log('app started at port 3002...');


