var page = require('webpage').create();
var testindex = 0;
var loadInProgress = false;

page.settings.resourceTimeout=15000;

page.onResourceRequested = function(requestData) {
    // console.info('Requesting', requestData.url);
};

page.onResourceTimeout = function(request) {
    console.log('Response (#' + request.url + '): ' + JSON.stringify(request));
    // if(request.url.endsWith('.gif'))    {}
};

page.onLoadStarted = function() {
    loadInProgress = true;
    console.log("load started");
};

page.onLoadFinished = function() {
    loadInProgress = false;
    console.log("load finished");
};

var steps = [
    function() {
        page.open("http://m.weibo.cn/1885454921/4153646393969612");
    },
    function() {
        page.render('weibo.png',{format: 'png', quality: '1'});
    }
];


var interval = setInterval(function() {

    if (!loadInProgress && typeof steps[testindex] == "function") {
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        phantom.exit();
    }
}, 2000);