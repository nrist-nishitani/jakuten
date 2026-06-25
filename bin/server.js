var http = require("http");
var Router = require("router");
var finalhandler = require('finalhandler');
var contents = require("./contents");
var api = require("./api");

require("./common/session");

function start() {
  var opts = { mergeParams: true };
  var router = Router(opts);

  var server = http.createServer(function onRequest(req, res) {
    router(req, res, finalhandler(req, res));
  });

  router.use("/js/{*path}", contents);
  router.use("/css/{*path}", contents);
  router.use("/img/{*path}", contents);
  router.use("/api/:api", session, api);
  router.get("/", session, require("./page/top"));
  router.use("/profile/", session, require("./page/profile"));
  router.use("/profile/:uid", session, require("./page/profile"));
  router.use("/history/", session, require("./page/history"));
  router.use("/history/:uid", session, require("./page/history"));
  router.use("/cat/:cat", session, require("./page/cat"));
  router.use("/item/:id", session, require("./page/item"));
  router.use("/cart", session, require("./page/cart"));
  router.use("/checkout", session, require("./page/checkout"));
  router.use("/thanks", session, require("./page/thanks"));
  router.use("/search", session, require("./page/search"));
  router.use("/admin", session, require("./page/admin"));
  router.use("/{*path}", contents);

  server.listen(3000);
  console.log("Welcome to JAKUTEN STORE.");
}

exports.start = start;
