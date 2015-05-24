var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var func=require("lib/func")
var Common=require("Lib/Common")
var async=require("async");
exports.start = function()
{
    setInterval(Check,1000);
    setInterval(CheckServerMsg,300);
    setInterval(CheckUserActive,10000);

}
//检测用户存活
function CheckUserActive()
{
    MySQL.list("select UserCode from RoomUser where "+func.time()+"-ActiveTime>30", function (err, Rows)
    {
        for (var i in Rows)
            Common.userQuit(Rows[i].UserCode);
    });
}
function Check()
{
    //检查印章过期
    CheckStamp();
    //保存服务器信息
    SaveInfo();
    //检测公麦状态
    CheckAutoMic()
}
//定时检测类
function SaveInfo() {
    try
    {
        //保存服务器信息
        MySQL.query("select * From SysServer where ServerIP='" + Socket.IP() + "' and ServerPort=" + Socket.port(),
            function (err,Row) {
                if (!Row)
                    MySQL.exec("insert into SysServer set ServerType=1,UserCount="+Socket.clientCount()+",ServerIP='" + Socket.IP() + "',ServerPort=" + Socket.port());
                else
                    MySQL.exec("update SysServer set ServerType=1,UserCount="+Socket.clientCount()+" where ServerIP='" + Socket.IP() + "'and ServerPort=" + Socket.port());

            });
    }
    catch (e)
    {
        func.Log("Err:SaveInfo "+e)
    }
}
function CheckServerMsg()
{
    try
    {
        //检测广播数据
        MySQL.list("select RoomMsg.Msg,RoomUser.UserCode From RoomMsg,RoomUser where ((RoomMsg.RoomCode=0 and RoomMsg.UserCode=0 ) or (RoomUser.UserCode=RoomMsg.UserCode or RoomUser.RoomCode=RoomMsg.RoomCode)) and ServerIP='"+Socket.IP()+"' and ServerPort="+Socket.port()+" order by RoomMsg.Id asc",
            function (err,Row) {
                if (!Row)
                    return;
                for (var j in Row)
                {
                    var Msg=Row[j].Msg;
                    var UserCode=Row[j].UserCode;
                    Socket.sendText(UserCode,Msg)

                }
                MySQL.exec("delete From RoomMsg where ServerIP='"+Socket.IP()+"' and ServerPort="+Socket.port());
            });

    }
    catch (e)
    {
        func.Log("Err:CheckHorn "+e)
    }
}

function CheckStamp()
{
    try
    {
        MySQL.list("select RoomUser.UserCode,RoomCode,UserStamp.LessTime from RoomUser,UserStamp where UserStamp.UserCode=RoomUser.UserCode", function (err, Rows)
        {
            for (var i in Rows)
            {
                var Time=Rows[i].LessTime;
                var UserCode=Rows[i].UserCode
                var RoomCode=Rows[i].RoomCode
                Time--
                if (Time<=0)
                {
                    MySQL.exec("delete from UserStamp where UserCode="+UserCode);

                    Common.saveServerMsg(Rows[i].RoomCode,0,"Stamp", UserCode, UserCode, 0);
                }
                else
                    MySQL.exec("update UserStamp set LessTime="+Time+" where UserCode="+UserCode);
            }
        });
    }
    catch (e)
    {
        func.Log("Err:CheckStamp "+e)
    }
}


function CheckAutoMic() {
    try {

        function UpOrderUser(AutoMic,RoomCode, MicPos,cb) {


            if (AutoMic!=1)
            {
                cb(false);
                return;
            }


            //检测麦上是否有用户
            MySQL.query("select UserCode From RoomUser where RoomCode=" + RoomCode + " and MicPos=" + MicPos, function (err, row) {
                if (row)
                {
                    cb(false);
                    return;
                }
                //检测麦序,把麦序中第一个用户抱上空麦
                MySQL.query("select * From RoomOrder where RoomCode=" + RoomCode + " limit 1", function (err, Row) {
                    if (!Row)
                    {

                        cb(false);
                        return;
                    }
                    MySQL.exec("update RoomUser set MicState=1,MicTime=" + func.time() + ",MicPos=" + MicPos + " where UserCode=" + Row.UserCode);

                    Common.saveServerMsg(RoomCode,0, "Action", Row.UserCode, Row.UserCode, 1, MicPos);

                    MySQL.exec("delete from RoomOrder where UserCode=" + Row.UserCode,function(err)
                        {
                            cb(true);
                        }
                    );
                });
            });
        }

        MySQL.list("select RoomCode,AutoMic1,AutoMic2,AutoMic3,AutoMic4,MicTime from RoomInfo where AutoMic1<>0 or AutoMic2<>0 or AutoMic3<>0  or AutoMic4<>0  or MicTime<>0", function (err, Row) {

            for (var i in Row) {
                var RoomCode=Row[i].RoomCode;
                //检测用户是否超过上麦时间

                if (Row[i].MicTime>0)
                {

                    MySQL.exec("update RoomUser set MicTime=MicTime-1 where  MicState>0 and RoomCode=" + RoomCode);
                    MySQL.list("select UserCode,MicTime,RoomCode From RoomUser where RoomCode=" + RoomCode + " and MicState>0", function (err, RoomUse) {

                        for (var j in RoomUse) {
                            if (RoomUse[j].MicTime <= 0) {

                                MySQL.exec("update RoomUser set MicTime=0,MicState=0,MicPos=0 and UserCode=" + RoomUse[j].UserCode);
                                Common.saveServerMsg(RoomUse[j].RoomCode,0, "Action", RoomUse[j].UserCode, RoomUse[j].UserCode, 1, 0);

                            }
                        }
                    });

                }

                UpOrderUser(Row[i].AutoMic1,RoomCode, 1,function(result){
                    if (result)
                        return;
                    UpOrderUser(Row[i].AutoMic2,RoomCode, 2,function(result){
                        if (result)
                            return;
                        UpOrderUser(Row[i].AutoMic3,RoomCode, 3,function(result){
                            if (result)
                                return;
                            UpOrderUser(Row[i].AutoMic4,RoomCode, 4,function(result){
                                if (result)
                                    return;

                            });
                        });
                    });
                });



            }
        });
    }
    catch (e)
    {
        func.Log("Err:CheckAutoMic "+e)
    }
}


