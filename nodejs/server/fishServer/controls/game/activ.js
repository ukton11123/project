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
        async.each(global.baseActiv,function(activ,callback){
            // 查询有无可接新活动
            if(activ.minLevel<=level && activ.maxLevel>level)
            {
                var SQL = "select * from userActiv where userName='" + userName + "' and activID="+activ.ID;
                mysql.query(SQL, function (err, row) {


                    if (!row)
                        mysql.exec("insert into userActiv set userName='" + userName + "',activID="+activ.ID+",getTime="+func.time(),function(err){
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
            var SQL= "select baseActiv.*,userActiv.getTime,userActiv.ID userActivID,userActiv.doneCount from baseActiv,userActiv where " +
                "userActiv.activID=baseActiv.ID  and userActiv.userName='" + userName + "'";
            //返回正在进行的活动
            mysql.list(SQL, function (err, rows) {
                if (err)
                    return client.error("操作失败。"+err);
                //返回已用时间
                for (var i in rows)
                {
                    rows[i].usedTime=parseInt(func.time()-rows[i].getTime);

                    rows[i].needTime=rows[i].addTime?rows[i].needTime*(rows[i].doneCount+1):rows[i].needTime;
                    if (rows[i].items)
                        rows[i].items=JSON.parse(rows[i].items)
                }

                client.send(rows)
            });

        });

    });
}

//完成活动
exports.done = function (client, userName,passWD,userActivID) {

    var SQL = "select exp,level from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
        var level=row.level;
        var exp=row.exp;

        var SQL = "select * from userActiv where userName='" + userName + "' and ID="+userActivID;

        mysql.query(SQL, function (err, row) {
            if (err)
                return client.error("操作失败");



            var activ=data.getData("baseActiv",row.activID);
            if (!activ)
                return client.error("操作失败");

            //检测合法性
            if (activ.minLevel>level || level>activ.maxLevel)
                return client.error("操作失败");

            var needTime=activ.addTime?activ.needTime*(row.doneCount+1):activ.needTime;
            if (row.doneCount>=activ.count)
                return client.error("操作失败");
            if (func.time()-row.getTime<needTime-1)
                return client.error("操作失败");

            //增加完成次数
            mysql.exec("update userActiv set getTime="+func.time()+",doneCount=doneCount+1 where  ID="+userActivID)

            //抽取道具
            var items=[];
            if(activ.randomItem)
            items.push(func.getRandomArr(activ.items));
            else
            items=activ.items;
            //添加道具
            common.addItem(userName,items)

            var expData = common.addExp(exp + activ.exp, level);
            //增加用户数据
            var SQL = "update userInfo  set money=money+" + activ.money + ",token=token+"+activ.token+",exp=" + expData.exp + ",level=" + expData.level + " where  username='" + userName + "'";
            mysql.exec(SQL, function (err) {
                if (err)
                    return client.error("操作失败");
                client.send(items,activ.money,activ.token,activ.exp)
            })


        });
    });
}
//付费开启宝箱
exports.openPayBox = function (client, userName,passWD,type,amount) {

    var SQL = "select money,token,level from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
            var level=row.level;
            var money=row.money;
            var token=row.token;
            var activ=null;
            for (var i in global.baseActiv)
            {
                if (global.baseActiv[i].type==type && global.baseActiv[i].minLevel<level  && global.baseActiv[i].maxLevel>level)
                    activ=global.baseActiv[i];
            }
            if (!activ)
                return client.error("操作失败");
        if (type==0  && money<global.sysSetup.normalBoxPrice*amount)
            return client.error("金币不足");
        if (type==1  && token<global.sysSetup.richBoxPrice*amount)
            return client.error("钻石不足");
            //抽取道具
            var items=[];
            if(activ.items.length>0)
                for (var i=0;i< amount;i++)
                    items.push(func.getRandomArr(activ.items));
            //添加道具
            common.addItem(userName,items)
        console.log(items)
        //扣除用户货币
        money=type==0?global.sysSetup.normalBoxPrice*amount:0;
        token=type==1?global.sysSetup.richBoxPrice*amount:0;
        var SQL = "update userInfo  set money=money-" + money + ",token=token-"+token+" where  username='" + userName + "'";
        mysql.exec(SQL, function (err) {
            if (err)
                return client.error("操作失败");
            client.send(items,-money,-token)
        })


    });
}


//签到
exports.sign = function (client, userName,passWD) {

    var SQL = "select ID from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
        var day=new Date().getDate();
        //查找当日签到活动
        var SQL = "select userActiv.ID,userActiv.activID,userActiv.doneCount from userActiv,baseActiv where " +
            "userActiv.activID=baseActiv.ID and userActiv.userName='" + userName + "' " +
            "and baseActiv.type=3 and  baseActiv.openTime="+day;

        mysql.query(SQL, function (err, row) {
            if (err || !row)
                return client.error("操作失败");


            var activ=data.getData("baseActiv",row.activID);
            if (!activ)
                return client.error("操作失败");

            //检测合法性
            if (row.doneCount>0)
                return client.error("今日已经签到");


            //增加完成次数
            mysql.exec("update userActiv set doneCount=doneCount+1 where  ID="+row.ID)

            //添加道具
            common.addItem(userName,activ.items)


            client.send(activ.items)

        });
    });
}