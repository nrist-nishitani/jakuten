var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var db = require('./common/db');
require("./common/session");

router.post("/", async function(req, res) {
    var session = req.session || {};
    console.log('API: ' + req.params.api + ' / Session Data: ' + JSON.stringify(session));
    res.setHeader("Content-Type", "application/json");
    var body = {};
    try{
        switch(req.params.api){
            case "login":
                var user = await db.get("SELECT id, email, family_name, first_name, family_name_kana, first_name_kana FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "';");
                if(!user){
                    res.statusCode = 404;
                    body = {error: 'メールアドレスまたはパスワードが違います' };
                    break;
                }
                res.statusCode = 200;
                res.setHeader('Set-Cookie', 'role=user; path=/; max-age=1800;');
                user.display_name = user.family_name + " " + user.first_name;
                session.user = user;
                break;
            case "logout":
                res.statusCode = 200;
                res.setHeader('Set-Cookie', 'role=guest; path=/; max-age=1800;');
                body = {};
                session.user = {};
                break;
            case "register":
                if(!req.body.email || !req.body.password || !req.body.family_name || !req.body.first_name || !req.body.family_name_kana || !req.body.first_name_kana){
                    res.statusCode = 400;
                    body = {error:'Parameter missing.'};
                    break;
                }
                var user = await db.get("select id from users where email = '" + req.body.email + "';");
                if(user){
                    res.statusCode = 500;
                    body = {error: 'メールアドレスが重複しています'};
                    break;
                }
                await db.run("insert into users (email, password, family_name, first_name, family_name_kana, first_name_kana) VALUES("
                    + "'" + req.body.email + "',"
                    + "'" + req.body.password + "',"
                    + "'" + req.body.family_name + "',"
                    + "'" + req.body.first_name + "',"
                    + "'" + req.body.family_name_kana + "',"
                    + "'" + req.body.first_name_kana + "'"
                    + ");");
                res.statusCode = 200;
                res.setHeader('Set-Cookie', 'role=user; path=/; max-age=1800;');
                var user = await db.get("select id, email, family_name, first_name, family_name_kana, first_name_kana from users where email = '" + req.body.email + "';");
                user.display_name = user.family_name + " " + user.first_name;
                session.user = user;
                break;
            case "addCart":
                if(!req.body.item || !req.body.amount){
                    res.statusCode = 400;
                    body = {error:'Parameter missing.'};
                    break;
                }
                if(!session.cart){
                    session.cart = {};
                }
                if(!session.cart.items){
                    session.cart.items = {};
                }
                var item = await db.get('SELECT id, sku, name, title, original_price, sale_price FROM items WHERE id = ' + req.body.item + ';');
                if(!session.cart.items[item.id]){
                    session.cart.items[item.id] = {
                        sku: item.sku,
                        name: item.name,
                        title: item.title,
                        price: item.sale_price,
                        amount: Number(req.body.amount)
                    };
                }else{
                    session.cart.items[item.id].amount = session.cart.items[item.id].amount + Number(req.body.amount);
                    if(session.cart.items[item.id].amount == 0){
                        delete session.cart.items[item.id];
                    }
                    res.statusCode = 200;
                }
                session.cart.count = 0;
                session.cart.total = 0;
                Object.keys(session.cart.items).forEach(function(key){
                    session.cart.count += session.cart.items[key].amount;
                    session.cart.total += session.cart.items[key].amount * session.cart.items[key].price;
                });
                console.log(' CART:' + JSON.stringify(session.cart));
                break;
            case "clearCart":
                session.cart = {};
                console.log(' CART:' + JSON.stringify(session.cart));
                break;
            case "comment":
                if(!req.body.user || !req.body.text || !req.body.item){
                    res.statusCode = 400;
                    body = {error:'Parameter missing.'};
                    break;
                }
                await db.run("insert into comments (user_id, item_id, entry_date, comment) VALUES("
                    + Number(req.body.user) + ","
                    + Number(req.body.item) + ","
                    + (new Date()).getTime() + ","
                    + "'" + req.body.text.replace(/\r?\n/g, '<br>') + "');");
                break;
            case "checkout":
                if(!session.cart || !req.body.pan || !req.body.expire_month || !req.body.expire_year || !req.body.cvc || !req.body.zip || !req.body.tel || !req.body.shipping_address || !req.body.total){
                    res.statusCode = 400;
                    body = {error:'Parameter missing.'};
                    break;
                }
                var date = new Date();
                await db.run("insert into orders (user_id, order_date, pan, expire_month, expire_year, cvc, zip, tel, shipping_address, total) VALUES("
                    + "'" + session.user.id + "',"
                    + date.getTime() + ","
                    + "'" + req.body.pan + "',"
                    + "'" + req.body.expire_month + "',"
                    + "'" + req.body.expire_year + "',"
                    + "'" + req.body.cvc + "',"
                    + "'" + req.body.zip + "',"
                    + "'" + req.body.tel + "',"
                    + "'" + req.body.shipping_address + "',"
                    + "'" + req.body.total + "'"
                    + ");");
                var order = await db.get("select id from orders where user_id = '" + session.user.id + "' order by order_date desc limit 1;");
                var order_id = order.id;
                Object.keys(session.cart.items).forEach(async function(key){
                    await db.run("insert into order_items (order_id, sku, item_name, item_title, price, amount) VALUES("
                        + order_id + ","
                        + "'" + session.cart.items[key].sku + "',"
                        + "'" + session.cart.items[key].name + "',"
                        + "'" + session.cart.items[key].title + "',"
                        + "'" + session.cart.items[key].price + "',"
                        + "'" + session.cart.items[key].amount + "'"
                        + ");");
                });
                session.cart = {};
                res.statusCode = 200;
                body = {};
                break;
            case "changeProfile":
                if(!req.body.attribute){
                    res.statusCode = 400;
                    body = {error:'Parameter missing.'};
                    break;
                }
                switch(req.body.attribute){
                    case "email":
                        if(!req.body.email){
                            res.statusCode = 400;
                            body = {error:'Parameter missing.'};
                            break;
                        }
                        db.run("update users set email = '" + req.body.email + "' where id = " + session.user.id + ";");
                        res.statusCode = 200;
                        body = {};
                        break;
                    case "password":
                        if(!req.body.password){
                            res.statusCode = 400;
                            body = {error:'Parameter missing.'};
                            break;
                        }
                        db.run("update users set password = '" + req.body.password + "' where id = " + session.user.id + ";");
                        res.statusCode = 200;
                        body = {};
                        break;
                    case "familyName":
                        if(!req.body.familyName || !req.body.familyNameKana){
                            res.statusCode = 400;
                            body = {error:'Parameter missing.'};
                            break;
                        }
                        db.run("update users set family_name = '" + req.body.familyName + "', family_name_kana = '" + req.body.familyNameKana + "' where id = " + session.user.id + ";");
                        res.statusCode = 200;
                        body = {};
                        break;
                    case "firstName":
                        if(!req.body.firstName || !req.body.firstNameKana){
                            res.statusCode = 400;
                            body = {error:'Parameter missing.'};
                            break;
                        }
                        db.run("update users set first_name = '" + req.body.firstName + "', first_name_kana = '" + req.body.firstNameKana + "' where id = " + session.user.id + ";");
                        res.statusCode = 200;
                        body = {};
                        break;
                    default:
                        res.statusCode = 400;
                        body = {error: 'No such attribute.'};
                }
                session.cart = {};
                console.log(' CART:' + JSON.stringify(session.cart));
                break;
            default:
                res.statusCode = 404;
                body = {error: 'No such API.'};
        }
    }catch(err){
        console.log(err);
        res.statusCode = 500;
        // body = {error: '予期せぬエラーです'};
        body = {error: '予期せぬエラーです<br><pre>' + err.stack + '</pre>'};
    }finally{
    // res.setHeader('Set-Cookie', 'jakuten=' + sessionHandler.build(session) + '; path=/; max-age=1800;');
    // sessionStore.update(req.sid, session);
        sessions[req.sid] = session;
        res.end(JSON.stringify(body));
    }
});

module.exports = router;
