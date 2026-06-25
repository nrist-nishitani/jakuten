
var path = require('path');
var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var { renderTemplate } = require('../common/template');
var db = require('../common/db');
var utils = require('../common/utils');

router.get("/", async function(req, res) {
    console.log('PAGE: ADMIN / Session Data: ' + JSON.stringify(req.session));
    var role = (req.headers.cookie + ';').match(/role=(.+?);/);
    if(!role || !role[1] || (role[1]  != 'admin')){
        res.statusCode = 200;
        res.setHeader("Content-Type", 'text/html; utf-8');
        renderTemplate('_base.ejs', {page: 'admin', error: 'admin 以外は利用できません'}, function(err, output){
            if (err) {
                console.error('Template render error:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
                return;
            }
            res.end(output);
        });
        return;
    }
    var result = await db.all('SELECT * FROM orders LEFT JOIN order_items ON orders.id = order_items.order_id LEFT JOIN users on orders.user_id = users.id;');
    var histories = {};
    result.forEach(function(entry){
        if(!histories[entry.order_id]){
            histories[entry.order_id] = {
                user_id : entry.user_id,
                user_name : entry.family_name + " " + entry.first_name,
                order_date : entry.order_date,
                pan : entry.pan,
                expire_month : entry.expire_month,
                expire_year : entry.expire_year,
                cvc : entry.cvc,
                zip : entry.zip,
                tel : entry.tel,
                shipping_address : entry.shipping_address,
                total : entry.total,
                items : [] 
            };
        }
        histories[entry.order_id].items.push({
            sku : entry.sku,
            item_name : entry.item_name,
            item_title : entry.item_title,
            price  : entry.price,
            amount : entry.amount
        });
    });
    if(!histories){
        res.statusCode = 404;
        res.setHeader("Content-Type", 'text/html; utf-8');
        renderTemplate('_base.ejs', {page: 'error', session: req.session}, function(err, output){
            if (err) {
                console.error('Template render error:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
                return;
            }
            res.end(output);
        });
    }else{
        res.statusCode = 200;
        res.setHeader("Content-Type", 'text/html; utf-8');
        renderTemplate('_base.ejs', {page: 'admin', session: req.session, histories: histories, utils: utils}, function(err, output){
            if (err) {
                console.error('Template render error:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
                return;
            }
            res.end(output);
        });
    }
});

module.exports = router;

