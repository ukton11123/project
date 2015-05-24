/**
 * Created by Administrator on 2015/5/11.
 */
var mysql = require("lib/mysql");
var data = require("../data");
var common = require("../common");
var async = require("async")
exports.get = function (client, userName) {

    var props=global.baseProps;
    for (var j in props)
        props[j].buyedAmount=0;
    var SQL = "select * from userProps where userName='" + userName+"'";
    mysql.list(SQL, function (err, rows) {
        for (var i in rows)
            for (var j in props)
                if (rows[i].propsID==props[j].ID)
                    props[j].buyedAmount += rows[i].amount;

        client.send(props);
    });
}

exports.buy = function (client, userName,passWD,id,amount) {
    var SQL = "select money,token from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
        var money = row.money;
        var token = row.token;
        var props = data.getData("baseProps", id)

        if (props.type==0  && money<props.price*amount)
            return client.error("金币不足");
        if (props.type==1  && token<props.price*amount)
            return client.error("钻石不足");
        //是否购买完毕
        var SQL = "select sum(amount) amount from userProps where userName='" + userName+"' and propsID="+id;
        mysql.query(SQL, function (err, row) {
            if(row)
            if (row.amount>=props.amount)
                return client.error("超出可购买数量");

            //增加用户物品
            var item = {};
            item.id = props.itemID;
            item.amount = amount;
            common.addItem(userName, [item])




            //扣除用户货币
            money=props.type==0?props.price*amount:0;
            token=props.type==1?props.price*amount:0;
            var SQL = "update userInfo  set money=money-" + money + ",token=token-"+token+" where  username='" + userName + "'";
            mysql.exec(SQL, function (err) {
                if (err)
                    return client.error("操作失败");
                //增加用户道具信息
                mysql.exec("insert userProps  set amount="+amount+",username='" + userName + "',propsID=" +id,function(){
                    client.send([item],-money,-token)
                })
            });

        });
    })
}