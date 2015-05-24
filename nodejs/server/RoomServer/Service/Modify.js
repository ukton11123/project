var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var Common=require("Lib/Common")
var async=require("async");
exports.OnData=function (client,RoomCode,RoomName,RoomExplain,RoomState,MicTime,LogoURL,SkinID,PassWD) {
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
            if (err) {
                OnError(ErrMsg2);
                return;
            }
        Common.getUserMoney(UserCode, PassWD, function (err, Money, UserType) {
            if (err) {
                OnError();
                return;
            }

            MySQL.exec("update RoomInfo Set RoomName='" + RoomName + "',RoomExplain='" + RoomExplain + "',RoomState=" + RoomState + ",MicTime=" + MicTime
                    + ",LogoURL='" + LogoURL + "',SkinID=" + SkinID + "  where RoomCode=" + RoomCode,
                function (err, result) {
                    if (err) {
                        OnError();
                        return;
                    }
                    MySQL.query("select * from RoomInfo where  RoomCode=" + RoomCode, function (err, Row) {
                        if (err) {
                            OnError();
                            return;
                        }
                        client.send("Modify", Row);
                    })
                });
        });
    });
}