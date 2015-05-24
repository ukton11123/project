
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var Config=require("./Config")
exports.get=function (client,UserCode,PassWD)
{

    var UserMoney
    Common.getUserMoney(UserCode,PassWD,function(err,money,userType){
        if (err)
            return client.error("操作失败。");
        UserMoney =money;

        SQL="select Money from GameFish where UserCode="+UserCode;
        MySQL.query(SQL,function(err,row)
        {
            if (err)
                return client.error("操作失败。");
            client.send(Config.get().rate,UserMoney,row.Money)

        });
    })



}