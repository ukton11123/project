//var cluster = require('cluster');
//var numCPUs = require('os').cpus().length;
//if (cluster.isMaster) {
//// Fork workers.
//    for (var i = 0; i < numCPUs; i++) {
//        cluster.fork();
//    }
//
//    cluster.on('exit', function(worker, code, signal) {
//        console.log('worker ' + worker.process.pid + ' died');
//    });
//} else

{
//创建数据库
    var mysql = require("lib/mysql");
    var config = require("../config.json");
    config.database="monster";
    mysql.init(config);


//错误捕获
    var func = require("lib/func");
    process.on('uncaughtException', function (err) {
        func.log("捕获的全局错误:" + err.stack);
    });

//创建http服务
    var http = require("lib/http");
    http.start(__dirname, 88);

//创建webSocket服务
    var ws = require("lib/webSocket");
    ws.start(__dirname,89);



//执行启动脚本
    var onStart = require("./Controls/onStart");
    onStart.start();
//    var child_process = require("child_process");
//    var n = child_process.fork('./server/web/child.js');
//    n.send({ hello: 'world' });

}
