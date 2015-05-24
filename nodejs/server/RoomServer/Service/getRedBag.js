/**
 * Created by Administrator on 2015/4/14 0014.
 */
var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var async=require("async");
var Common=require("Lib/Common")
var data=require("./data");
exports.OnData=function (client,RoomCode,PassWD,id) {
    var SenderCode=client.name;
    const  Msg = "抢红包";
    const   MSG_Error = Msg + "失败，处理出错。";
    const   MSG_RankError = Msg + "失败，您或对方所在的用户组无此权限。";
    const   MSG_BagError1 = "红包已经被抢完。";
    const   MSG_BagError2 = "您不能重复抢此红包。";
    const   MSG_BagError3 = "您不能抢自己发布的红包。";
    function OnError(ErrMsg) {
        if (!ErrMsg)
            ErrMsg = MSG_Error;
        client.send("Error", ErrMsg);
    }
    var userMoney;
    var redBagMoney;
    var getMoney;
    var totalMoney;
    var getRedBaginfo;
    async.waterfall([
        //获取用户金币
        function (cb) {
            Common.getUserMoney(SenderCode, PassWD, function (err, money, UserType) {

                if (!data.Rank(UserType).Gift) {
                    cb(1,MSG_RankError);
                    return;
                }
                userMoney = money;
                cb(err);
            });
        },
        //获取红包信息
        function (cb) {
            MySQL.query("select userCode,money,totalMoney,info from UserRedBag where id=" + id, function (err, Row) {
                if (Row)
                {
                    if (Row.userCode==SenderCode)
                    return cb(1,MSG_BagError3);
                    redBagMoney = Row.money;
                    totalMoney= Row.totalMoney;
                    getRedBaginfo=Row.info;
                    if (getRedBaginfo)
                    {
                    var infoArr = getRedBaginfo.split(',');
                    if (infoArr.indexOf(SenderCode) != -1)
                       return cb(1,MSG_BagError2);
                    }
                    getRedBaginfo += "," + SenderCode;
                }
                if(err)
                return cb(1,MSG_BagError1);
                cb(err);
            })
        },
        //增加金币
        function (cb) {
            getMoney = parseInt(Math.random() * (totalMoney / 10));
            if (redBagMoney <= 0)
                return cb(1,MSG_BagError1);

            if(getMoney>redBagMoney)
                getMoney=redBagMoney;
            userMoney+=getMoney;
            Common.setUserMoney(SenderCode, userMoney, function (err, Result) {
                cb(err)
            });
        },
        //添加交易记录
        function (cb) {
            Common.saveMoneyRecord(31, "抢红包", SenderCode, getMoney, userMoney, function (err, Result) {
                cb(err)
            });
        },
        //扣除红包金额
        function (cb) {
            if(getMoney==redBagMoney)//红包抢完,删除数据
            {
                MySQL.exec("delete from  UserRedBag  where id="+id, function (err, Result) {
                    cb(err)
                });
            }
            else
            MySQL.exec("update  UserRedBag set  money=money-"+getMoney+",info='"+getRedBaginfo+"' where id="+id, function (err, Result) {
                cb(err)
            });
        },
        //广播消息
        function (cb) {
            Common.saveServerMsg(RoomCode,0, "getRedBag",SenderCode,getMoney);
        }
    ], function (err, values) {
        if (err)
            OnError(values);
    });
}