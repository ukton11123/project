var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")

exports.OnData=function (client,RoomCode) {
    var UserCode=client.name;
    var ErrMsg = "处理出错。";

    function OnError() {
        client.send("Error", ErrMsg);
    }

     MySQL.list("select * from UserRoom where  RoomGroup in (3,4,5) and RoomCode=" + RoomCode, function (err, Rows) {
                        if (err) {
                            OnError();
                            return;
                        }
         client.send("ManagerList", Rows);
       })
}