var MySQL=require("lib/MySQL")
var func=require("lib/func")
exports.OnData=function (client) {

    var SQL="update RoomUser Set  ActiveTime="+func.time()+" where UserCode=" + client.name;
    MySQL.exec(SQL);
}