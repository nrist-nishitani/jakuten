// users.js
const mimes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.js': 'text/javascript'
};

var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);
var fs = require('fs');
const path = require('path');
var url = require('parseurl');

// Check if running as SEA
let isSEA = false;
let getAsset = null;
try {
  const sea = require('node:sea');
  getAsset = sea.getAsset;
  isSEA = true;
} catch (err) {
  // Not running as SEA
}

router.get("/", function(req, res) {
  res.statusCode = 200;
  console.log(' STATIC:' + req.originalUrl);
  const pathname = url.original(req).pathname;
  const file = path.join(__dirname, '../resources/contents/' + pathname);
  res.setHeader("Content-Type", mimes[path.extname(file)] || 'text/plain');

  if (isSEA) {
    // Try to load from SEA embedded resources
    try {
      const assetKey = 'contents' + pathname.replace(/\\/g, '/');
      const assetData = getAsset(assetKey);
      // Convert ArrayBuffer to Buffer
      const content = Buffer.from(assetData);
      res.end(content);
    } catch (err) {
      errorResponse(404, res);
    }
  } else {
    // Load from external file
    fs.stat(file, function(err, stat){
      if(err) return errorResponse(404, res);
      if(stat.isFile()){
        fs.createReadStream(file).pipe(res);
        res.end;
      }else{
        errorResponse(404, res);
      }
    });
  }
});


function errorResponse(code, res){
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not Found\n');
}

module.exports = router;