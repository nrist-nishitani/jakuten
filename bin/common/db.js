var fs = require('fs');
var path = require('path');

var { DatabaseSync } = require('node:sqlite');

var file = './db.sqlite';
var db = prepare();

function prepare(){
    try{
        var stat = fs.statSync(file);
        stat.isFile();
    }catch(err){
        // Try to load from SEA embedded resources first
        var data;
        try {
            const { getAsset } = require('node:sea');
            const assetData = getAsset('db/initial.sqlite');
            // Convert ArrayBuffer to Buffer
            data = Buffer.from(assetData);
            console.log('Loaded database from SEA embedded resources');
        } catch (seaErr) {
            // Fallback to external file if not running as SEA
            data = fs.readFileSync(path.join(__dirname, '../../resources/db.sqlite'));
            console.log('Loaded database from external file');
        }
        fs.writeFileSync('./db.sqlite', data);
    }
    var db = new DatabaseSync(file);
    return db;
};

exports.all =  function(sql, rows){
    return new Promise((resolve, reject) => {
        console.log('  SQL:' + sql);
        try{
            var stmt = db.prepare(sql);
            var result = stmt.all();
            resolve(result);
        }catch(error){
            reject(new Error('Databse Error: SQL=' + sql + '\n-----\n' + error.stack ));
        }
    });
}
exports.get =  function(sql, rows){
    return new Promise((resolve, reject) => {
        console.log('  SQL:' + sql);
        try{
            var stmt = db.prepare(sql);
            var result = stmt.get();
            resolve(result);
        }catch(error){
            reject(new Error('Databse Error: SQL=' + sql + '\n-----\n' + error.stack ));
        }
    });
}
exports.run =  function(sql, rows){
    return new Promise((resolve, reject) => {
        console.log('  SQL:' + sql);
        try{
            var stmt = db.prepare(sql);
            stmt.run();
            resolve(null);
        }catch(error){
            reject(new Error('Databse Error: SQL=' + sql + '\n-----\n' + error.stack ));
        }
    });
}