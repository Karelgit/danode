var system = require('system');
var args = system.args;
var md5 = require('md5');

if (args.length === 1) {
    console.log('Try to pass some arguments when invoking this script!');
} else {
    var postUrl = args[1];
    var postMd5 = args[2];
    // var postMd5 = md5(postUrl);
    console.log('postUrl: '+ postUrl + ' postMd5: '+ postMd5 );
    var imgname = postMd5+'.png';

    var page = require('webpage').create();
    var testindex = 0;
    var loadInProgress = false;

    //page的设置
    // page.settings.javascriptEnabled = false;
    page.settings.resourceTimeout=3000;
    page.viewportSize = {width: 1024, height : 800 };
    page.clipRect = { top: 0, left: 0, width: 1024, height: 800 };

    page.onResourceRequested = function(requestData,networkRequest) {
        //规则过滤(去掉一些无用请求)
        if(requestData.url.endsWith('.gif')
            ||requestData.url.startsWith('http://weibo.com/aj/v6/comment/big')
            ||requestData.url.includes('video'))    {
            networkRequest.abort();
        }
    };

    page.onResourceTimeout = function(request) {
        // console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
        console.log('Timeout >>> ' + request.url);
    };

    page.onResourceError = function(resourceError) {
        console.log('>>>>>>Unable to load resource (# ' + resourceError.id + 'URL:' + resourceError.url + ')');
    };

    page.onLoadStarted = function() {
        loadInProgress = true;
        console.log("load started");
    };

    page.onLoadFinished = function() {
        loadInProgress = false;
        console.log("load finished");
    };

    page.open(postUrl);

    var steps = [
        /*function() {
            page.open(postUrl);
        },*/
        function() {
            page.render('./static/'+imgname, {format: 'png', quality: '1'});
        }
    ];

    setInterval(function() {
        if (!loadInProgress && typeof steps[testindex] == "function") {
            steps[testindex]();
            testindex++;
        }
        if (typeof steps[testindex] != "function") {
            //计算title
            var title = page.evaluate(function () {
                return document.title;
            })
            console.log('title:'+title)
            phantom.exit();
        }
    }, 3000);
}




