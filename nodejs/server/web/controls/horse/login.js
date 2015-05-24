var mysql=require("lib/mysql")
exports.get=function (client,UserCode,PassWD) {
    var UserMoney,NickName,FishInfo

    SQL="select UserMoney,NickName from userInfo where UserCode="+UserCode+" and PassWD='"+PassWD+"'";
    mysql.query(SQL,function(err,row)
    {
        if (err)
            return client.error("登录失败。");

        UserMoney =row.UserMoney;
        NickName=row.NickName;


        SQL="select PoolMoney from GameHorse";
        mysql.query(SQL,function(err,row)
        {if (err)
            return client.error("登录失败。");

            client.send(UserMoney,row.PoolMoney,global.sysSetup.MoneyName,NickName)
        });

    });
}

