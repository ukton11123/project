
var Common=require("lib/Common")
exports.get=function (client,UserCode,PassWD)
{

    Common.getUserMoney(UserCode,PassWD,function(err,userMoney)
    {
        if (err)
            return client.error("登录失败。");
        client.send(global.sysSetup.MoneyName,userMoney)

    });
}