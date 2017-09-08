#图片截图服务 by 黄海

#访问方式

request url = http://{domain}:3002/load
request body = {
                   "postUrl":"http://news.163.com/17/0831/18/CT6GAV500001899O.html",
                   "postMd5":"a3a54639b0984d2686f256a982004040"
               }
response body= 图片的二进制文件
request.head.title = 网页的title               