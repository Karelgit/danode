const crypto = require('crypto');

const hash = crypto.createHash('md5');
hash.update('http://www.163.com/');

console.log(hash.digest('hex'))





