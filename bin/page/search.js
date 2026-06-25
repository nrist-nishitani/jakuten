var path = require('path');
var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var { renderTemplate } = require('../common/template');
var db = require('../common/db');

router.get("/", async function(req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", 'text/html; utf-8');
    renderTemplate('_base.ejs', {page: 'search', session: req.session, keyword: "", message: "", items: {}}, function(err, output){
        if (err) {
            console.error('Template render error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
        }
        res.end(output);
    });
});

router.post("/", async function(req, res) {
    console.log('PAGE: SEARCH / Session Data: ' + JSON.stringify(req.session));
    var items = {};
    var keyword = "";
    if(!req.body.cat || !req.body.keyword){
        message = "";
    }else{
        keyword = req.body.keyword;
        items = await db.all("SELECT id, sku, name, title FROM items WHERE desc like '%" + keyword + "%' and category = '" + req.body.cat + "';");
        var message = "以下の商品が見つかりました";
        if(!items || !items.length){
            items = {};
            message = "商品は見つかりませんでした";
        }
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", 'text/html; utf-8');
    renderTemplate('_base.ejs', {page: 'search', session: req.session, keyword: keyword, message: message, items: items}, function(err, output){
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
