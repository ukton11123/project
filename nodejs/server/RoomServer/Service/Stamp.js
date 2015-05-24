var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var async=require("async");
var Common=require("Lib/Common")
var data=require("./data");
exports.OnData=function (client,RoomCode,TargetCode,StampID,PassWD) {

    var SenderCode=client.name;
    const  Msg = "盖章";
    const   MSG_Error = Msg + "失败，处理出错。";
    const     MSG_MoneyError = Msg + "失败，余额不足。";
    const   MSG_RankError = Msg + "失败，您或对方所在的用户组无此权限。";
    function OnError(ErrMsg) {
        if (!ErrMsg)
            ErrMsg = MSG_Error;
        client.send("Error", ErrMsg);
    }
    var Sender;
    var SenderMoney;
    var Stamp;
    if (StampID == 0) {
        OnError();
        return;
    }
    console.log(StampID)
    Stamp = data.Stamp(StampID);
    if (!Stamp) {
        OnError();
        return;
    }
    async.waterfall([
        //获取用户金币
        function (cb) {
            Common.getUserMoney(SenderCode, PassWD, function (err, Money, UserType) {

                if (!data.Rank(UserType).Gift) {
                    cb(MSG_RankError);
                    return;
                }
                SenderMoney = Money;

                if (SenderMoney < Stamp.Price) {
                    cb(MSG_MoneyError);
                    return;
                }
                SenderMoney -= Stamp.Price;

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
            Common.saveMoneyRecord(3, "盖章", SenderCode, -Stamp.Price, SenderMoney, function (err, Result) {
                cb(err)
            });
        },
        //为对象添加印章
        function (cb) {
            MySQL.exec("delete from UserStamp where UserCode=" + TargetCode);
            MySQL.exec("Insert into UserStamp (UserCode,LessTime,StampID) VALUES(" + TargetCode + "," + Stamp.Time * 60 + "," + StampID + ")", function (err, Result) {
                cb(err)
            });
        },
        //广播消息
        function (cb) {
            Common.saveServerMsg(RoomCode,0, "Stamp", SenderCode, TargetCode, StampID);

        }
    ], function (err, values) {
        if (err)
            OnError();
    });
}