/**
 * Created by Administrator on 2015/4/14 0014.
 */
var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var async=require("async");
var Common=require("Lib/Common")
var data=require("./data");
exports.OnData=function (client,RoomCode,PassWD,money) {
    var SenderCode=client.name;
    const  Msg = "发布红包";
    const   MSG_Error = Msg + "失败，处理出错。";
    const     MSG_MoneyError = Msg + "失败，余额不足。";
    const   MSG_RankError = Msg + "失败，您或对方所在的用户组无此权限。";
    function OnError(ErrMsg) {
        if (!ErrMsg)
            ErrMsg = MSG_Error;
        client.send("Error", ErrMsg);
    }
    var SenderMoney;
    var redBagID;
    async.waterfall([
        //获取用户金币
        function (cb) {
            Common.getUserMoney(SenderCode, PassWD, function (err, userMoney, UserType) {

                if (!data.Rank(UserType).Gift) {
                    cb(MSG_RankError);
                    return;
                }
                SenderMoney = userMoney;

                if (SenderMoney < money) {
                    cb(MSG_MoneyError);
                    return;
                }
                SenderMoney -= money;

                cb(err);
            });
        },
        //扣除金币
        function (cb) {
            Common.setUserMoney(SenderCode, SenderMoney, function (err, Result) {
                cb(err)
            });
        },
        //添加交易记录
        function (cb) {
            Common.saveMoneyRecord(30, "送红包", SenderCode, -money, SenderMoney, function (err, Result) {
                cb(err)
            });
        },
        //添加进入数据库
        function (cb) {
           var realMoney= parseInt(money*((100-global.sysSetup.RedBagFee)/100))
            MySQL.exec("Insert into UserRedBag (UserCode,RoomCode,Money,totalMoney) VALUES(" + SenderCode + "," + RoomCode+ ","
                + realMoney + "," + money + ")", function (err, Result) {

                cb(err)
            });
        },
        //读取插入记录的ID
        function(cb)
        {
            MySQL.query("select ID from UserRedBag where UserCode="+SenderCode+" order by id desc limit 1",function(err,Row)
            {
                if (Row)
                    redBagID=Row.ID;
                cb(err);
            });
        },
        //广播消息
        function (cb) {
            Common.saveServerMsg(RoomCode,0, "sendRedBag", redBagID,SenderCode,money);

        }
    ], function (err, values) {
        if (err)
            OnError();
    });
}