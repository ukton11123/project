var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var Common=require("Lib/Common")
var async=require("async");
var data=require("./data");
exports.OnData=function (client,Type,RoomCode,TargetCode,Text,PassWD,NickName,Face) {
    var UserCode=client.name;
    var ErrMsg = "发言失败，处理出错。";
    var MSG_MoneyError = "发送广播失败，余额不足。";

    function OnError() {
        client.send("Error", ErrMsg);
    }

    //广播公聊内容
    if (Type == 1)
        Common.saveServerMsg(RoomCode,0,"Chat",Type, Text, UserCode, TargetCode);
    //转发私聊内容
    if (Type == 2) {
        MySQL.query("select UserCode from RoomUser where RoomCode=" + RoomCode + " and UserCode=" + TargetCode,function (err, Row) {
            if (err) {
                OnError()
                return;
            }
            Common.saveServerMsg(0,Row.UserCode,"Chat",Type, Text, UserCode, TargetCode);
            Common.saveServerMsg(0,UserCode,"Chat",Type, Text, UserCode, TargetCode);
        });
    }
//喇叭
    var BroadCastNeedMoney=global.sysSetup.BroadCastNeedMoney
    if (Type == 3) {


        var UserMoney;
        async.series([ GetUserMoney, SetUserMoney, SaveMoneyRecord, SaveHorn, SaveToZone], function (err, values) {
            if (err) {
                OnError();
                return;
            }
        });
    }


//获取用户金币
    function GetUserMoney(cb)
    {
        Common.getUserMoney(UserCode,PassWD,function(err,Money)
        {

            UserMoney=Money;
            if (UserMoney < BroadCastNeedMoney)
            {
                cb(MSG_MoneyError);
                return;
            }
            UserMoney-=BroadCastNeedMoney;

            cb(err);
        });
    }
//扣除发送者金币
    function SetUserMoney(cb)
    {

        Common.setUserMoney(UserCode, UserMoney,  function (err,Result) {cb(err)});
    }
//添加交易记录
    function SaveMoneyRecord(cb) {
        Common.saveMoneyRecord(4,"系统喇叭",UserCode, -BroadCastNeedMoney,UserMoney,function (err,Result) {cb(err)});

    }
    function SaveHorn(cb) {
        //发送全服广播
        Text=Common.makeHornHead(RoomCode,UserCode,NickName,Face)+Text;

        Common.saveServerMsg(0,0,"Chat",3,Text,0,0);
        cb();

    }
    function SaveToZone(cb) {
//保存到空间
        Common.saveToZone(UserCode, Text, RoomCode);
        cb();
    }
}