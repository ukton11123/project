var mysql = require("lib/mysql");
var func = require("lib/func");
var data = require("../data");
var game = require("./game");
exports.on = function (client, userName,passWD,tableID,pos) {


    if (!tableID || !pos)
        return client.err("处理失败。");
    if (tableID>setup.maxUser)
        return client.err("超出游戏最大人数。");


    if (tableID>setup.maxTable)
        return client.err("找不到游戏桌。");

    if (pos>setup.maxTableUser)
        return client.err("找不到游戏桌位置。");

    function checkUser(userName)
    {
        var table=game.getTable(tableID);
        for (var i in table.users)
            if (table.users[i].userName==userName)
                return true;
        return false;
    }
    function checkUserPos(userName)
    {
        var table=game.getTable(tableID);
        for (var i in table.users)
            if (table.users[i].pos==pos)
                return true;
        return false;
    }
    userName=1;
    pos=1;
    if (game.getTable(tableID))
    {
        while (checkUser(userName))
            userName++;
        while (checkUserPos(pos))
            pos++;
    }
    //验证用户
    var SQL = "select * from user where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");
        //查找游戏桌,如果没有 新建
        var table=game.getTable(tableID);
        if (!table)
        {
            table=new game.Table();
            table.id=tableID;
            table.mapID=1;
            table.time=func.time();
            global.tables.push(table);
        }

        //判断位置是否可坐
        for (var i in table.users)

        {
            if (table.users[i].id==row.id)
            {
                table.users.splice(i,1);
                table.sockets.splice(i,1);
            }
            else
            if (table.users[i].pos==pos)
                return client.err("此位置已经有用户。");
        }

        var user={};
        user.id=row.id;
        user.nickName=row.nickName;
        user.userName=userName;
        user.gameMoney=0;
        user.gunMoney=global.setup.minGunMoney;
        user.bullets=[];
        user.pos=pos;

        //发送进入游戏消息
        for (var i in table.users)
            table.sockets[i].send("onEnter",user);

        table.sockets.push(client);
        table.users.push(user);


        client.send("onData",global.setup,global.fish,global.fishs);
        client.send("onLogin",row.id,pos,row.money,tableID,table.mapID,table.users);

    });

}