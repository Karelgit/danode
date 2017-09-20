const phantom = require('phantom');
const fs = require('fs');
const Koa = require('koa');
const path = require('path')
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const static = require('koa-static');
const child_process = require('child_process');


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

router.post('/load', async function(ctx) {
    var
        postUrl = ctx.request.body.postUrl;
        postMd5 = ctx.request.body.postMd5;
        var imgname = postMd5+'.png';

    //postUrl.startsWith('http://weibo.com/')|| postUrl.startsWith('http://m.weibo.cn/')
    if(postUrl.startsWith('http://weibo.com/')|| postUrl.startsWith('http://m.weibo.cn/')) {
        postUrl = postUrl.replace(/&/g,'\\&');
        console.log('**使用phantomjs command进行微博链接'+postUrl+'下载*****');
        var timebefore = new Date().getTime();
        var requestlog = child_process.execSync(`phantomjs render.js ${postUrl} ${postMd5}`);
        var timeafter = new Date().getTime();
        console.log(postUrl+' 的运行日志'+ requestlog.toString()+"\n"+ '原生phantomjs耗时：'+(timeafter-timebefore)/1000);
        var c = fs.readFileSync(`static/${imgname}`);
        var title;
        if(c!==null)    {

            var arr =requestlog.toString().split('\n');
            for(var i in arr)   {
                if(arr[i].startsWith('title:'))  {
                    title = arr[i].replace('title:','');
                    break;
                }
            }
            // console.log('title:'+title);
            ctx.response.append('title',encodeURIComponent(title));
            ctx.response.body = fs.readFileSync(`static/${imgname}`);
        }else {
            ctx.response.append('title',encodeURIComponent(title));
            ctx.response.body = {"result":false,"msg":"下载失败"};
            ctx.response.status = 404;
        }
    }else {
        const instance = await phantom.create();
        const page = await instance.createPage();
        page.property('viewportSize',{ width: 1024, height : 800 });
        page.property('clipRect',{  top: 0, left: 0, width: 1024, height: 800 });
        page.property('javascriptEnabled',false);
        // page.setting('userAgent','Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36');
        page.setting('resourceTimeout',15000);

        await page.property()
        //资源请求普通处理
        await page.on('onResourceRequested', function(requestData) {
            console.info('Requesting', requestData.url);
        });

        const timeout = await page.on('onResourceTimeout', function(request) {
            console.log('timeout request: '+ request.url);
        });


        //open函数简单处理
        const status = await page.open(postUrl);
        console.info('status: '+ status);

        const title = await page.evaluate(function () {
            return document.title;
        })
        console.info("title: "+title)


        if(status ==='fail')  {
            ctx.response.append('title',encodeURIComponent(title));
            ctx.response.body = {"result":false,"msg":"下载失败"};
            ctx.response.status = 404;
        }else  {
            await page.render(`static/${imgname}`, {format: 'png', quality: '1'});
            await page.close();
            ctx.response.append('title',encodeURIComponent(title));
            ctx.response.body = fs.readFileSync(`static/${imgname}`);
        }
        await instance.exit();
    }
});

app.use(bodyParser());
app.use(router.routes());

app.listen(3002);
console.log('app started at port 3002...');


