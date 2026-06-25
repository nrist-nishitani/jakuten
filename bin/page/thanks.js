var path = require('path');
var Router = require("router");
var opts = { mergeParams: true };
var router = Router(opts);

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var { renderTemplate } = require('../common/template');
var db = require('../common/db');

router.get("/", function(req, res) {
    console.log('PAGE: THANKS / Session Data: ' + JSON.stringify(req.session));
    if(!req.session || !req.session.user || !req.session.user.id) {
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
        renderTemplate('_base.ejs', {page: 'thanks', session: req.session}, function(err, output){
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
