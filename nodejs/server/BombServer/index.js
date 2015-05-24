
    var ServicePath = __dirname + "\\Service\\";//当前服务目录
    var options = process.argv;
    var ServerPort = options[2];
    if (!ServerPort)
    ServerPort=9800;

    var func = require("lib/func");
//初始化数据库
    var mysql = require("lib/mysql");
    var config = require("../config.json");
    config.database="bomb";
    mysql.init(config);


//启动模块
    var onStart = require("./Service/onStart");
    onStart.start()

//捕捉全局错误
    process.on('uncaughtException', function (err) {
        func.log("捕获的全局错误:"+err.stack);
    });

    // 参数说明端口  是否创建flash服务  服务路径
    var Socket = require("lib/Socket");

    Socket.start(ServerPort, true, ServicePath);











