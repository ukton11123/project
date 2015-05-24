var mysql = require("lib/mysql");
var data = require("../data");
var game = require("./game");
exports.on = function (client,userName,passWD, tableID,type) {


    //查找游戏桌
    var table=game.getTable(tableID);
    if (!table)
        return client.err("操作失败。1");
    var user=table.getUser(client);
    if (!user)
        return client.err("操作失败。2");
    //验证用户
    var SQL = "select * from user where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。3");
        var money=row.money;
        var gameMoney=0;
        //上下分
        if (type == 1) {
            if (money<global.setup.converMoney)
                return client.error("金币不足,请尽快充值。");

            user.gameMoney+= global.setup.converRate * global.setup.converMoney;
            money-=global.setup.converMoney;
            for (var i in table.users)
                table.sockets[i].send("onGameMoney", user.id, user.gameMoney,user.gunMoney);

        }
        if (type == 2) {
            money+= Math.floor(user.gameMoney/global.setup.converRate);
            user.gameMoney =0;
            for (var i in table.users)
                table.sockets[i].send("onGameMoney", user.id, user.gameMoney,user.gunMoney);
        }
        mysql.exec("update user set money="+money+",gameMoney="+user.gameMoney)

        client.send("onMoney",money);
    });

}