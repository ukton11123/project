var mysql = require("lib/mysql");
var data = require("../data");
var game = require("./game");
exports.on = function (client) {
    console.log("quit");
    //退出游戏
    var user=null;
    for (var j in global.tables)
    {
        var table=global.tables[j];
        for (var i in table.sockets)
            if (table.sockets[i]==client)
            {
                user=table.users[i]

                table.users.splice(i,1);
                table.sockets.splice(i,1);
                //发送退出游戏消息
                for (var k in table.users)
                    table.sockets[k].send("onQuit",user.id);

            }
    }
    if (!user)
        return;
    //自动下分
    var SQL = "select * from user where id=" + user.id;
    mysql.query(SQL, function (err, row) {
            if (err)
                return;
            var money=row.money;
            money+= Math.floor(user.gameMoney/global.setup.converRate);
            user.gameMoney =0;
            mysql.exec("update user set gameMoney=0,money=" + money);
        }
    );



}