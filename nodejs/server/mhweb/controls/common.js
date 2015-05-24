/**
 * Created by Administrator on 2015/4/24.
 */
//通用函数库
var data = require("./data");
var mysql = require("lib/mysql");
var func=require("lib/func");
var async = require("async")
//获取当前等级满经验
function getMaxExp(level,value)
{
    return value*(level * level * level +5*level)-80;
}
exports.getMaxExp=getMaxExp;


//增加经验
exports.addExp=function (exp,level) {
//检测升级
    while (exp > getMaxExp(level,global.sysSetup.levelUpValue)) {
        exp -= getMaxExp(level,global.sysSetup.levelUpValue);
        level += 1;
    }
    return {"exp":exp,"level":level};
}
//增加物品经验
exports.addItemExp=function (exp,level) {
//检测升级
    while (exp > getMaxExp(level,global.sysSetup.itemlevelUpValue)) {
        exp -= getMaxExp(level,global.sysSetup.itemlevelUpValue);
        level += 1;
    }
    return {"exp":exp,"level":level};
}
//获取物品战斗力
exports.getItemFight=function (ID) {
    var item= data.getData("baseItem",ID)
    return item?item.att+item.def+item.hp+item.crt*10+item.aov*10+item.hit*10:0;
}
//完成任务
exports.finishTask=function(userName,taskID)
{
    mysql.exec("update userTask set state=2 where userName='" + userName + "' and taskID="+taskID)
    //新建后续任务
    for (var i in global.baseTask)
    {
        if (global.baseTask[i].preID==taskID)
        {
            var sql="insert into userTask set userName='" + userName + "',taskID="+global.baseTask[i].ID+",time="+func.time();
            mysql.exec(sql);
        }

    }
}
//为用户增加物品
exports.addItem=function (userName,items,cb)
{
    async.eachSeries(items,function(dropItem,callback){
        if (!dropItem)
         return callback()
        var item = data.getData("baseItem", dropItem.itemID);
        if (item)
        {
            var SQL = "select itemID,userName from userItem  where  username='" + userName + "' and amount+"+dropItem.amount+"<"+item.maxAmount+" and itemID=" + dropItem.id;

            mysql.query(SQL,function(err,row){
                if (row)
                    SQL2="update userItem  set amount=amount+"+dropItem.amount+" where   amount+"+dropItem.amount+"<"+item.maxAmount+" and username='" + userName + "' and itemID=" + dropItem.id;

                else
                    SQL2="insert userItem  set amount="+dropItem.amount+",username='" + userName + "',itemID=" +dropItem.id;

                mysql.exec(SQL2,function(){
                    callback()
                });

            })
        }else
            callback()

    },function(err){
        if (cb)
            cb(err)

    })
}

