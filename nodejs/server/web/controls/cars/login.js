var mysql=require("lib/mysql")
var encoding = require('encoding');
exports.get=function (client,UserCode,PassWD) {
    var UserMoney,NickName
    const MoneyName="酷币";
    SQL="select UserMoney,NickName from userInfo where UserCode="+UserCode+" and PassWD='"+PassWD+"'";
    mysql.query(SQL,function(err,row)
    {

        if (err)
            return client.error("登录失败。");

        UserMoney =row.UserMoney;
        NickName=encoding.convert(row.NickName,"utf-8","gb2312").toString();

        SQL="select PoolMoney from GameCars";
        mysql.query(SQL,function(err,row)
        {
            if (err)
            return client.error("登录失败。");

                client.send(UserMoney,row.PoolMoney,MoneyName,NickName)
            });

    });
}

