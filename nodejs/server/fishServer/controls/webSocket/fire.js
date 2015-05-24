var mysql = require("lib/mysql");
var data = require("../data");
var game = require("./game");
exports.on = function (client, tableID,pos,bulletID) {


    //查找游戏桌
    var table=game.getTable(tableID);
    if (!table)
        return client.err("操作失败。");
    var user=table.getUser(client);
    if (!user)
        return client.err("操作失败。");
    if(user.gameMoney<user.gunMoney)
        return  client.err("渔币不足,请上分。");
    //创建子弹
    var bullet={};
    bullet.id=bulletID;
    bullet.money=user.gunMoney;
    user.bullets.push(bullet);

    user.gameMoney-=user.gunMoney;

    for (var i in table.users)
    {
        table.sockets[i].send("onFire", user.id,user.gameMoney, pos,bulletID);
    }


}