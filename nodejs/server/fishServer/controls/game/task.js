var mysql = require("lib/mysql");
var func=require("lib/func");
var data = require("../data");
var common = require("../common");
var async = require("async");
exports.get = function (client, userName,passWD) {

    var SQL = "select level from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";

    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");

        var level=row.level;

        async.each(global.baseTask,function(task,callback){
            // 查询有无可接新任务
            if(task.level<=level && task.preID==0)
            {
                var SQL = "select * from userTask where userName='" + userName + "' and taskID="+task.ID;
                mysql.query(SQL, function (err, row) {
                    if (!row)
                        mysql.exec("insert into userTask set userName='" + userName + "',taskID="+task.ID+",time="+func.time(),function(err){
                            callback();
                        });
                    else
                        callback();
                });
            }
            else
                callback();

        },function (err) {
            if (err)
                return client.error("操作失败。");
            //返回正在进行的任务
            mysql.list( "select * from userTask where state=1 and userName='" + userName + "'", function (err, rows) {

                if (err)
                    return client.error("操作失败。"+err);

                client.send(rows)
            });

        });

    });
}


//完成任务
exports.finish = function (client, userName,passWD,taskID,free,amount) {
    var money,exp,level,token;
    var SQL = "select money,exp,level,token from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");

        money=row.money;
        exp=row.exp;
        level=row.level;
        token=row.token;
        var SQL = "select * from userTask where userName='" + userName + "' and ID="+taskID;
        mysql.query(SQL, function (err, row) {
            if (err)
                return client.error("操作失败。");

            if (row.state!=1)
                return client.error("操作失败。");
            var task=data.getData("baseTask",row.taskID);
            if (!task)
                return client.error("操作失败。");

            if (row.amount<task.amount)
               return client.error("操作失败。");

            //完成任务
            common.finishTask(userName,task.ID);


            //增加奖励物品
            common.addItem(userName,task.items)

            //增加用户数据
            //增加经验
            money+=task.money;
            token+=task.token;
            var expData = common.addExp(exp + task.exp, level);
            var SQL = "update userInfo  set money=" + money + ", exp=" + expData.exp + ",token="+token+", level=" + expData.level + " where  username='" + userName + "'";
            mysql.exec(SQL, function (err) {
                if (err)
                    return client.error("操作失败。");
                client.send(task.money,task.exp,task.token,task.items)
            })

        });
    });
}