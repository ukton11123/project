var mysql = require("lib/mysql");
var data = require("../data");
var game = require("./game");
exports.on = function (client, tableID,type) {


    //查找游戏桌
    var table=game.getTable(tableID);
    if (!table)
        return client.err("操作失败。");
    var user=table.getUser(client);
    if (!user)
        return client.err("操作失败。");
    if (type==1)
    {
        user.gunMoney+=global.setup.minGunMoney;
    if (user.gunMoney>global.setup.maxGunMoney)
        user.gunMoney=global.setup.minGunMoney;
    }
    if (type==2)
    {
        user.gunMoney-=global.setup.minGunMoney;
        if (user.gunMoney<global.setup.minGunMoney)
            user.gunMoney=global.setup.maxGunMoney;
    }
    for (var i in table.users)
         table.sockets[i].send("onGameMoney", user.id, user.gameMoney,user.gunMoney);


}


