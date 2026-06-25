var path = require('path');
var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var db = require('../common/db');
var { renderTemplate } = require('../common/template');

// var session = require("../common/session");

router.get("/", async function(req, res) {
    console.log('PAGE: TOP / Session Data: ' + JSON.stringify(req.session));
    var banners = await db.all('SELECT id, title, desc, link FROM banners;');
    var cards = await db.all('SELECT id, sku, name, title FROM items WHERE category IS NOT NULL limit 6;');
    res.statusCode = 200;
    res.setHeader("Content-Type", 'text/html; utf-8');
    renderTemplate('_base.ejs', {page: 'top', session: req.session, banners: banners, cards: cards}, function(err, output){
        if (err) {
            console.error('Template render error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
        }
        res.end(output);
    });
});

module.exports = router;
