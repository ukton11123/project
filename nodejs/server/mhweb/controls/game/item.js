var mysql = require("lib/mysql");
var data = require("../data");
var common = require("../common");
var async = require("async")
exports.get = function (client, userName) {
    var SQL = "select * from userItem where userName='" + userName + "'";
    mysql.list(SQL, function (err, rows) {
        if (err)
            return client.error("操作失败。");
        client.send(rows)
    });
}

//使用物品
exports.use = function (client, userName, passWD,id,amount) {
    var SQL = "select ID,itemID,amount from userItem  where userName='" + userName + "' and ID =" + id;
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");
        if (row.length == 0)
            return client.error("操作失败。");
        if (row.amount<amount)
            return client.error("操作失败。");
        var item=data.getData("baseItem",row.itemID)
        if (!item)
            return client.error("操作失败。");
        //消耗品 增加数值
        if(item.itemType==1)
        {
            var  name;
            if (item.type==0)
             name="power";
            if (item.type==1)
                name="exp";
            if (item.type==2)
                name="money";
            if (item.type==3)
                name="token";
            var SQL="update  userInfo set "+name+"="+name+"+"+ item.value*amount+ " where userName='" + userName + "'";

            mysql.exec(SQL)
        }
        //碎片或宝箱
        if(item.itemType==2 || item.itemType==3) {
            if (item.itemType == 2) {


            if (row.amount < amount)
              return client.error("碎片数量不足。");

            amount=parseInt(amount/item.pieceAmount);
            if (amount==0)
                    return client.error("碎片数量不足。");
        }

            for (var j=0;j<amount;j++)
            for( var i in item.items)
            mysql.exec("insert userItem  set username='" + userName + "',itemID=" +item.items[i].id);

        }
        if(item.itemType==2)
            amount=amount*item.pieceAmount;
        if (row.amount>amount)
         SQL = "update  userItem set amount=amount-"+amount+" where id ="+id;
        else
         SQL = "delete from userItem  where   id ="+id;
        mysql.exec(SQL);
        client.send(id,amount,item.items)
    });
}

//卖出物品
exports.sell = function (client, userName,  passWD,ids) {
    var sellMoney = 0;
    var SQL = "select ID,itemID from userItem  where userName='" + userName + "' and ID in (" + ids + ")";
    mysql.list(SQL, function (err, rows) {
        if (err)
            return client.error("操作失败。");
        if (rows.length == 0)
            return;
        //增加金币

        for (var i in rows) {
            var itemFight = common.getItemFight(rows[i].itemID)
            var money = parseInt(itemFight / global.sysSetup.itemPriceRate);
            sellMoney += money;
            mysql.exec("update  userInfo set money=money+" + money + " where userName='" + userName + "'")
        }
        SQL = "delete from userItem  where userName='" + userName + "' and ID in (" + ids + ")";

        mysql.exec(SQL)
        client.send(ids, sellMoney)
    });
}

//强化物品
exports.streng = function (client, userName, passWD, id, ids) {
    var SQL = "select money from userInfo  where userName='" + userName + "' and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (!row)
            return client.error("操作失败。");
        var usreMoney=row.money;
        var SQL = "select ID,itemID from userItem  where userName='" + userName + "' and ID in (" + ids + ")";
        mysql.list(SQL, function (err, rows) {
            if (err)
                return client.error("操作失败。");
            if (rows.length == 0)
                return;
            var money = 0;
            var exp = 0;
            for (var i in rows) {
                var row=rows[i];
                var item = data.getData("baseItem", row.itemID);
                //计算所需金币
                money += (item.quality + 1) * item.needLevel * global.sysSetup.strengMoney;
                //计算增加经验
                exp += (item.quality + 1) * item.needLevel * global.sysSetup.strengExp;
            }

            if (money>usreMoney)
             return client.error("金币不足。");

            //强化装备
            var SQL = "select exp,level from userItem  where userName='" + userName + "' and ID="+id;
            mysql.query(SQL, function (err, row) {
                //增加经验
                var itemExp = common.addItemExp(row.exp + exp, row.level).exp;
                var itemLevel = common.addItemExp(row.exp + exp, row.level).level;
                mysql.exec("update  userItem set exp="+itemExp+",level="+itemLevel+"  where userName='" + userName + "' and ID="+id)
                //删除强化材料
                mysql.exec("delete from userItem  where userName='" + userName + "' and ID in (" + ids + ")")
                //扣除金币
                mysql.exec("update  userInfo set money=money-" + money + " where userName='" + userName + "'")
                client.send(id,ids,exp,money)
            })
        })
    })
}
//装备物品
exports.equip = function (client, userName, passWD, ID) {
    var equiped, itemID;
    var SQL = "select equiped,itemID from userItem  where userName='" + userName + "' and ID=" + ID;

    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("该物品不存在。");
        equiped = row.equiped == 1 ? 0 : 1;
        itemID = row.itemID
        if (equiped == 0)//卸下
        {
            mysql.exec("update userItem set equiped=0  where ID=" + ID);
            client.send(ID, equiped);
        }
        if (equiped == 1) //装备
        {
            var type = data.getData("baseItem", itemID).type;
            //判断装备位置是否重复
            SQL = "select userItem.ID from userItem,baseItem  where userItem.equiped=1 and userItem.itemID=baseItem.ID and baseItem.type=" + type + " and userItem.userName='" + userName + "'";
            mysql.query(SQL, function (err, row) {
                //如果有装备,卸下
                if (row)
                    mysql.exec("update userItem set equiped=0  where ID=" + row.ID);

                mysql.exec("update userItem set equiped=1  where ID=" + ID);

                client.send(ID, equiped, row ? row.ID : 0);

            });
        }
    });
}