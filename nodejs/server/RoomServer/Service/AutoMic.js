var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var Common=require("Lib/Common")
var async=require("async");
exports.OnData=function (client,RoomCode,ID,Value,PassWD) {
    var UserCode=client.name;
    var ErrMsg = "修改失败,处理出错。";
    const  MSG_Error2 = "此操作需要副室主级别以上。";
    function OnError(MSG_Error) {
        client.send("Error", MSG_Error);
    }
    Common.getUserInfo(UserCode, function (err,row) {
        if (err) {
            OnError();
            return;
        }
        if (row.RoomType<3)
        {
                OnError(MSG_Error2);
                return;
            }
        Common.getUserMoney(UserCode, PassWD, function (err, Money, UserType) {
            if (err) {
                OnError();
                return;
            }

           var SQL="update RoomInfo Set  AutoMic"+ID+" = "+Value+" where RoomCode=" + RoomCode;

            MySQL.exec(SQL,function (err, result) {
                    if (err) {
                        OnError();
                        return;
                    }
                Common.saveServerMsg(RoomCode,0,"AutoMic",ID,Value);
                });
        });
    });
}