var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var func=require("lib/func")
var async=require("async");
var common=require("Lib/common")
var data=require("./data");
exports.OnData=function (client,RoomCode,TargetCode,GiftID,Count,PassWD) {
    var SenderCode=client.name;
    const  Msg = "送礼";
    const   MSG_Error = Msg + "失败，处理出错。";
    const     MSG_MoneyError = Msg + "失败，余额不足。";
    const   MSG_RankError = Msg + "失败，您或对方所在的用户组无此权限。";

    function OnError(ErrMsg) {
        if (!ErrMsg)
            ErrMsg = MSG_Error;
        Socket.send(SenderCode, "Error", ErrMsg);
    }
    if (Count == 0) {
        OnError();
        return;
    }
    var SenderMoney,TargetMoney,RoomerMoney;
    var Gift;
    var Room;
    if (GiftID == 0) {
        OnError();
        return;
    }

    Gift = data.Gift(GiftID);
    if (!Gift) {
        OnError();
        return;
    }
    var SendMoney=Gift.Price*Count;
    var TargetRecMoney=parseInt(SendMoney*((100-Gift.fee-global.sysSetup.GiftRoomerFee)/100))
    var RoomerRecMoney=parseInt(Gift.Price*Count*(global.sysSetup.GiftRoomerFee/100))
    var LuckyRate = 0;
    async.waterfall([
            //获取房间信息金币
            function (cb) {
                common.getRoomInfo(RoomCode, function (err,row) {
                    Room=row;

                    cb(err);
                });

            },
            //获取用户金币
            function (cb) {
                common.getUserMoney(SenderCode, PassWD, function (err, Money, UserType) {

                    if (!data.Rank(UserType).Gift) {
                        cb(MSG_RankError);
                        return;
                    }
                    SenderMoney = Money;

                    if (SenderMoney < SendMoney) {
                        cb(MSG_MoneyError);
                        return;
                    }
                    SenderMoney -= SendMoney;
                    cb(err);
                });
            },
            //获取对方金币
            function (cb) {
                common.getUserMoney(TargetCode, null, function (err, Money, UserType) {


                    if (!data.Rank(UserType).Gift) {
                        cb(MSG_RankError);
                        return;
                    }

                    TargetMoney = Money;
                    TargetMoney+=TargetRecMoney;
                    cb(err);
                });
            },

            //扣除金币
            function (cb) {
                common.setUserMoney(SenderCode, SenderMoney, function (err, Result) {
                    cb(err)
                });
            },//增加对方金币
            function (cb) {
                common.setUserMoney(TargetCode, TargetMoney, function (err, Result) {
                    cb(err)
                });
            },


            //添加交易记录
            function (cb) {

                var SQL = "Insert into UserMoney(RoomCode,RecordType,SenderCode,SendMoney,RecordName,DealTime,SenderLess,TargetCode,ReciveMoney,TargetLess,GiftID)";
                SQL += "VALUES("+RoomCode+",1,"+SenderCode+","+(-SendMoney)+",'礼物','"+func.now()+"',"+SenderMoney+","+TargetCode+","+TargetRecMoney+","+TargetMoney+","+Gift.ID+")";
                MySQL.exec(SQL,function(err,result)
                    {
                        if (!err)
                        {
                            Socket.send(SenderCode,"Money",-SendMoney,SenderMoney);
                            Socket.send(TargetCode,"Money",TargetRecMoney,TargetMoney);
                        }
                        cb(err)
                    }
                );

            },
            //获取室主金币
            function (cb) {
                common.getUserMoney(Room.RoomerCode,null, function (err, Money, UserType) {
                    if (!err) {
                        RoomerMoney = Money;
                        RoomerMoney += RoomerRecMoney;
                    }
                    cb();
                });
            },
            //增加室主金币
            function (cb) {
                if (!RoomerMoney)
                    cb()
                else
                    common.setUserMoney(Room.RoomerCode, RoomerMoney, function (err, Result) {
                        cb(err)
                    });
            },
            //添加室主交易记录
            function (cb) {
                if (!RoomerMoney)
                    cb()
                else
                common.saveMoneyRecord(7, "礼物分成", Room.RoomerCode, RoomerRecMoney, RoomerMoney, function (err, Result) {
                    cb(err)
                });
            },

            //保存礼物信息
            function (cb) {


                //幸运礼物
                if (Gift.Lucky)
                {

                    var LuckyNum = parseInt(Math.random()*1000);

                    //500倍大奖
                    if (LuckyNum == 0)
                        LuckyRate = 500;

                    if (LuckyNum > 1 && LuckyNum < 5)//100倍大奖
                        LuckyRate = 100;
                    //50倍大奖
                    if (LuckyNum > 5 && LuckyNum < 20)
                        LuckyRate = 50;
                    //10倍大奖
                    if (LuckyNum > 20 && LuckyNum < 50)
                        LuckyRate = 10;

                    SenderMoney+=Gift.Price*LuckyRate;

                    if (LuckyRate>0)
                    {
                        common.setUserMoney(SenderCode, SenderMoney)
                        common.saveMoneyRecord(9, "幸运礼物", SenderCode, Gift.Price*LuckyRate, SenderMoney);
                    }

                }

                //需要广播的礼物
                if (Gift.Send || LuckyRate>=50)
                {
                    common.getUserInfo(SenderCode,function(err,row)
                    {
                        var SenderName=row.NickName;
                        var Face=row.Face;
                        common.getUserInfo(TargetCode,function(err,row)
                        {
                            var TargetName=row.NickName;
                            var Text = " 赠送给 " + TargetName + "[" + TargetCode + "]"  + Gift.Name;
                            if (LuckyRate>=50)
                                Text += "，中了" + LuckyRate +"倍大奖,获得<font color=&quot;red&quot;>" + Gift.Price*LuckyRate +"</font>"+ global.sysSetup.MoneyName;
                            var Text=common.makeHornHead(RoomCode,SenderCode,SenderName,Face)+Text

                            common.saveServerMsg(0,0,"Chat",3,Text,0,0);

                        });
                    });

                }
                //保存贵重礼物
                if (Gift.Rich)
                {

                    common.getUserInfo(SenderCode,function(err,row)
                    {
                        var SenderName=row.NickName;
                        common.getUserInfo(TargetCode,function(err,row)
                        {
                            var TargetName=row.NickName;
                            //删除之前保存的礼物信息
                            MySQL.exec("delete  from  RoomGift ",function(err,result) {
                                var SQL = "insert into RoomGift (RoomCode,GiftID,Count,SenderCode,TargetCode,GiftTime,SenderName,TargetName) VALUES(" + RoomCode
                                    + "," + GiftID + ", " + Count + "," + SenderCode + "," + TargetCode;
                                SQL += ",'" + func.now() + "','" + SenderName + "','" + TargetName + "')";
                                MySQL.exec(SQL);

                                common.sendRichGift();
                            });
                        });
                    });

                }
                cb()
            },
            //广播消息
            function (cb) {
                common.saveServerMsg(RoomCode,0,"Gift", SenderCode, TargetCode, GiftID,Count,Gift.Lucky,LuckyRate);
            }
        ]
        , function (err, values) {
            if (err)
                OnError(err);
        });
}
