var mysql = require("lib/mysql");
var data = require("../data");
var common = require("../common");
var async = require("async")
exports.get = function (client, userName) {

    var SQL = "select * from userRound where userName='" + userName + "'";
    mysql.list(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");

        client.send(row);
    });
}


exports.clear = function (client, userName,passWD,type,roundID, time,count) {

    var round = data.getData("baseRound", roundID);
    if (!round)
        return client.error("操作失败。");


    var money, exp,addExp, level,currPartID, currRoundID, levelUp,star,maxExp, dropItemArr,power;
    async.series([getUser,checkData, setUserInfo, getItems, getStar,addTask, send], function (err, result) {
        if (err)
            client.error(err);
    });
    //读取分析用户信息
    function getUser(cb) {
        var SQL = "select money,exp,level,part,round,power from  userInfo  where  username='" + userName + "' and passWD='"+passWD+"'";
        mysql.query(SQL, function (err, row) {

            if (err)
                return cb("操作失败。1");
            //增加金币
            money =  round.money*count;
            //增加经验
            exp = common.addExp(row.exp + round.exp*count, row.level).exp;
            level = common.addExp(row.exp + round.exp*count, row.level).level;
            if (level<round.level)
                return cb("等级不足");
            power=row.power;
            if (power<round.power*count)
                return cb("体力不足");
            power-=round.power*count;
            if (power<0)
                power=0;

            cb(err);
        });
    }
    function checkData(cb)
    {
        if(type==1)
        {
            var SQL = "select *  from  userRound  where  username='" + userName + "' and roundID="+roundID;
            mysql.query(SQL, function (err, row) {
                //检测扫荡条件
                if(!row)
                    return cb("未3星通关,无法扫荡")
                if(row.star!=3)
                    return cb("未3星通关,无法扫荡")

                cb();
            });
        }
        else
            cb();
    }
    //设置用户信息
    function setUserInfo(cb) {
        var SQL = "update userInfo  set money=money+" + money + ", exp=" + exp + ",power="+power+", level=" + level + " where  username='" + userName + "'";
        mysql.exec(SQL, function (err) {
            cb(err);
        })
    }
    //抽取掉落物品
    function getItems(cb) {


        dropItemArr = [];
        for (var j=0;j<count;j++)
            for (var i in round.items) {
                var dropItem=round.items[i];
                var item = data.getData("baseItem", dropItem.id);
                if (!item)
                    return client.error("操作失败。");

                if (Math.random() * 100 > global.sysSetup["quality"+item.quality])
                    continue;
                dropItemArr.push(dropItem);
            }

        //增加掉落物品
        common.addItem(userName,dropItemArr)
        cb()

    }
    //计算通关星级
    function getStar(cb) {
        if (type==0)
        {
            if (time/round.time>0)
                star=1;
            if (time/round.time>0.33)
                star=2;
            if (time/round.time>0.66)
                star=3;
            var SQL = "select star from  userRound  where  username='" + userName + "' and roundID="+round.ID;
            mysql.query(SQL, function (err, row) {

                if (row)
                {
                    if(row.star<star)
                        mysql.exec("update userRound set star="+star+"  where  username='" + userName + "' and roundID="+round.ID);
                }
                else
                {
                    mysql.exec("insert userRound set star="+star+"  ,username='" + userName + "',roundID="+round.ID);
                }
                cb()
            });
        }
        else
            cb()
    }
    //增加任务完成进度
    function addTask(cb) {

        var SQL = "select * from  userTask  where  username='" + userName + "' and state=1";
        mysql.list(SQL, function (err, rows) {

            for (var i in rows)
            {
                var row=rows[i];
                //增加任务完成数量
                var task=data.getData("baseTask",row.taskID);
                if (task.kind==0 && task.target==round.ID && row.amount<task.amount)
                {
                    var amount=row.amount+count;
                    if (amount>task.amount)
                        amount=task.amount
                    mysql.exec("update userTask set amount="+amount+"  where  ID="+row.ID);
                }
            }
        })
        cb()
    }
    function send(cb) {
        var data={};
        data.money=money;
        data.exp=round.exp*count;
        data.level=level;
        data.star=star;
        data.items=dropItemArr;
        data.power=power;
        client.send(data);
    }

}