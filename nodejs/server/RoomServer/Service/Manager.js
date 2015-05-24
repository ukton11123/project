var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var Common=require("Lib/Common")
var async=require("async");
exports.OnData=function (client,RoomCode,Type,Code,PassWD) {
    var UserCode=client.name;
    var ErrMsg = "修改失败,处理出错。";
    var ErrMsg2 = "此操作需要副室主级别以上。";
    function OnError() {
        client.send("Error", ErrMsg);
    }
    Common.getUserInfo(UserCode, function (err,row) {
        if (err) {
            OnError();
            return;
        }
        if (row.RoomType<3)
        {
            OnError(ErrMsg2);
            return;
        }
        Common.getUserMoney(UserCode, PassWD, function (err, Money, UserType) {
            if (err) {
                OnError();
                return;
            }
            if (Type==1)
                AddManager(RoomCode,Code);
            if (Type==2)
                DelManager(RoomCode,Code);
            if (Type==3)
                AddSubRoomer(RoomCode,Code);
            if (Type==4)
                DelSubRoomer(RoomCode,Code);
            if (Type==5)
                AddBlack(RoomCode,Code);
            if (Type==6)
                DelBlack(RoomCode,Code);
            client.send("Manager");

        });
    });
}
exports.AddManager=AddManager;
exports.DelManager=DelManager;
exports.AddSubRoomer=AddSubRoomer;
exports.DelSubRoomer=DelSubRoomer;
exports.AddBlack=AddBlack;
exports.DelBlack=DelBlack;

function AddManager(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (3,5) and UserCode="+Code+" and RoomCode="+RoomCode)
    MySQL.exec("insert UserRoom set RoomGroup=3,UserCode="+Code+",RoomCode="+RoomCode)
    MySQL.exec("update RoomUser set RoomType=2 where RoomCode="+RoomCode+" and UserCode="+Code)
}
function DelManager(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (3) and UserCode="+Code+" and RoomCode="+RoomCode)
    MySQL.exec("update RoomUser set RoomType=0 where RoomCode="+RoomCode+" and UserCode="+Code)
}
function AddSubRoomer(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (3,5) and UserCode="+Code+" and RoomCode="+RoomCode)
    MySQL.exec("insert UserRoom set RoomGroup=5,UserCode="+Code+",RoomCode="+RoomCode)
    MySQL.exec("update RoomUser set RoomType=3 where RoomCode="+RoomCode+" and UserCode="+Code)
}
function DelSubRoomer(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (5) and  UserCode="+Code+" and RoomCode="+RoomCode)
    MySQL.exec("update RoomUser set RoomType=0 where RoomCode="+RoomCode+" and UserCode="+Code)
}
function AddBlack(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (4) and  UserCode="+Code+" and RoomCode="+RoomCode)
    MySQL.exec("insert UserRoom set RoomGroup=4,UserCode="+Code+",RoomCode="+RoomCode)
}
function DelBlack(RoomCode,Code)
{
    MySQL.exec("delete from UserRoom where RoomGroup in (4) and  UserCode="+Code+" and RoomCode="+RoomCode)
}