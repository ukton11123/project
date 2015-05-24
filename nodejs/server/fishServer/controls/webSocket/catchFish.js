var mysql = require("lib/mysql");
var data = require("../data");
var game = require("./game");
exports.on = function (client, tableID,bulletID,fishIDs) {


        //查找游戏桌
        var table=game.getTable(tableID);
        if (!table)
            return client.err("操作失败。");
        var user=table.getUser(client);
        if (!user)
            return client.err("操作失败。");
        var money=0;
        for (var i in user.bullets)
        if (user.bullets[i].id==bulletID)
        {
            money=user.bullets[i].money
            user.bullets.splice(i,1);
        }
        if (!money)
        return console.log("未发现子弹"+bulletID)

        var catchFishs=[];
        for (var i in fishIDs) {
            var fish = table.getFish(fishIDs[i]);
            if (!fish)
                return client.err("未发现鱼信息,操作失败。");

            if (Math.random() * 100 > fish.info.killRate / global.setup.hard)
                continue;

                user.gameMoney+=money*fish.info.times;
                var catchFish={};
                catchFish.id=fishIDs[i];
                catchFish.money=money*fish.info.times;
                catchFishs.push(catchFish);
                table.fishs.splice(table.fishs.indexOf(fish),1);
                fish=null;
            }



        if (catchFishs.length>0) {
            for (var i in table.users)
            table.sockets[i].send("onCatchFish", user.id, user.gameMoney, catchFishs);
        }


}