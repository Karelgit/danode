var system = require('system');
var args = system.args;
var md5 = require('md5');
// var givenUrl = "http://weibo.com/ttarticle/p/show?id=2309404153642029595114";
var urls = [];
var waitTimeout = null

var page = require("webpage").create();
page.settings.resourceTimeout=3000;
page.viewportSize = {width: 1024, height : 800 };
page.clipRect = { top: 0, left: 0, width: 1024, height: 800 };


if (args.length === 1) {
    console.log('Try to pass some arguments when invoking this script!');
} else {
    var postUrl = args[1];
    var postMd5 = args[2];
    // var postMd5 = md5(postUrl);
    console.log('postUrl: ' + postUrl + ' postMd5: ' + postMd5);
    var imgname = postMd5 + '.png';

    var page = require('webpage').create();
    var loadInProgress = false;
}

function getPage(url) {
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

    /* This DOESN'T work; for some reason the timeout is not set again on the last URL */
    page.XonUrlChanged = function(newUrl) {
        if (newUrl !== url) {
            clearTimeout(waitTimeout)
            // console.log("url changed to "+newUrl)
            getPage(newUrl);
        }
    }

    page.onNavigationRequested = function(newUrl, type, willNavigate, main) {
        if (newUrl !== url) {
            urls.push(newUrl);
            clearTimeout(waitTimeout)
            // console.log("\turl changed to "+newUrl)
            getPage(newUrl);
        }
    }
    page.open(url, function(status) {
        if (status == "success" ) {
            waitTimeout = setTimeout(function() {
                // console.log("\nstarted with "+givenUrl+"\tthen went to  "+urls.join(", then\n\t"));
                page.render('./static/'+imgname, {format: 'png', quality: '1'})
                phantom.exit();
            }, 10);
        }
    });
}
// getPage(givenUrl);
getPage(postUrl);