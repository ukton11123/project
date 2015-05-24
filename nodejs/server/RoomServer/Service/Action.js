var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var async=require("async");
var data=require("./data");
var Manager=require("./Manager");
//状态   1上麦  2开视频  3 排麦  4 管理(1-3)  5 禁止文字  6 禁止音频  7 禁止视频  8 踢出   9 退出
exports.OnData=function (client,RoomCode,TargetCode,Type,Value,PassWD)
{
    var SenderCode=client.name
    const  MSG_Error = "操作失败，处理出错。";
    const  MSG_Error2 = "此麦上已经有人";
    function OnError(ErrMsg){
        if (!ErrMsg) ErrMsg=MSG_Error;
        client.send("Error", ErrMsg);
    }
    var Room,Sender,Target;

    async.series([CheckUserInfo, GetRoomInfo, GetSenderInfo,GetTargetInfo,Start], function (err, values) {
        if (err)
            OnError();
    });
    //检测用户合法性
    function CheckUserInfo(cb)
    {
        MySQL.query("select * From UserInfo where UserCode=" + client.name+ " and PassWD='"+PassWD+"'",function(err,row)
        {
            cb(err);
        });
    }
    //获取聊天室信息
    function GetRoomInfo(cb)
    {
        MySQL.query("select RoomerCode,MicTime,RoomType From RoomInfo where RoomCode=" + RoomCode,function(err,row)
        {
            Room=row;
            cb(err);

        });
    }
    //获取发送者信息
    function GetSenderInfo(cb)
    {
        MySQL.query("select * From RoomUser where UserCode =" + SenderCode,function(err,row)
        {

            Sender = row;
            cb(err);

        });
    }
    //获取接受者信息
    function GetTargetInfo(cb)
    {
        MySQL.query("select * From RoomUser where UserCode =" + TargetCode,function(err,row)
        {

            Target = row;
            cb(err);

        });
    }

    //开始处理
    function Start(cb)
    {

        //判断权限
        //操作条件
        // if 操作等级<对象
        //不可操作
        //if 操作等级 = 对象
        //        if 房间等级<=对象
        //            不可操作
        //        if  房间等级>对象
        //            if 我是室主  and  对方不可被室主操作
        //                不可操作
        //            if 我是副室主 and  对方不可被副室主操作
        //                不可操作
        //            if 我是管理 and  对方不可被管理操作
        //                不可操作
        //            if 我是临时管理 and  对方不可被临时管理操作
        //                不可操作
        // if  操作等级>对象
        //            可操作
        if (SenderCode != TargetCode)
        {
            //比较操作等级
            if (data.Rank(Sender.UserType).Operat < data.Rank(Target.UserType).Operate)
            {
                OnError();
                return;
            }
            if (data.Rank(Sender.UserType).Operat == data.Rank(Target.UserType).Operate)
            {
                //比较房间等级
                if (Sender.RoomType <= Target.RoomType)
                {
                    OnError();
                    return;
                }

                if (Sender.RoomType < data.Rank(Target.UserType).ManagerDeal)
                {
                    OnError();
                    return;
                }
            }
        }

        if (Type == 1)
        {//上麦
            if (Value > 0)
            {
                if (SenderCode == TargetCode)//检测是否有上麦权限
                {
                    if (Sender.RoomType == 0 && data.Rank(Sender.UserType).AutoSpeak == 0 && Room.RoomType != 10)
                    {
                        OnError();
                        return;
                    }
                }

                //检测麦上是否有人
                MySQL.query("select MicPos From RoomUser where MicPos="+Value+" and RoomCode=" + RoomCode,function(err,row)
                {
                    if (row) {
                        OnError(MSG_Error2);
                        return;
                    }

                    MySQL.exec("update RoomUser set MicState=1,MicTime="+(Room.MicTime*60)+",MicPos="+Value+" where UserCode="+Target.UserCode)

                });

            }

            if (Value == 0)//下麦
            {
                MySQL.exec("update RoomUser set MicState=0,MicPos=0,MicTime=0 where UserCode="+Target.UserCode)
            }

        }
        if (Type == 2)//打开视频
        {

            MySQL.exec("update RoomUser set MicState="+(Value+1)+" where UserCode="+Target.UserCode)

        }
        if (Type == 3)//排麦
        {
            if(Value==1)
            {
                MySQL.exec("insert RoomOrder set RoomCode="+RoomCode+" , UserCode="+Target.UserCode)

            }
            else
                MySQL.exec("delete from  RoomOrder where RoomCode="+RoomCode+" and UserCode="+Target.UserCode)


        }
        //管理
        if (Type == 4) {
            if (Value == 0) {
                Manager.DelManager(RoomCode, TargetCode);
                Manager.DelSubRoomer(RoomCode, TargetCode);
            }
            if (Value == 1)
                MySQL.exec("update RoomUser set RoomType=1 where RoomCode="+RoomCode+" and UserCode="+TargetCode)
            if (Value == 2)
                Manager.AddManager(RoomCode, TargetCode);
            if (Value == 3)
                Manager.AddSubRoomer(RoomCode, TargetCode);
        }

        if (Type == 8)
        {//踢出房间
            if (Value == 1)//添加入黑名单
                Manager.AddBlack(RoomCode, TargetCode);

            Common.userQuit(TargetCode);
        }
        Finish();
    }

    function Finish()
    {
        Common.saveServerMsg(RoomCode,0,"Action",SenderCode,TargetCode,Type,Value)
    }


}

