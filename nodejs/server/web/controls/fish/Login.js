
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var Config=require("./Config")
var encoding = require('encoding');
exports.get=function (client,UserCode,PassWD)
{

    var UserMoney,NickName,FishInfo

        SQL="select UserMoney,NickName from userInfo where UserCode="+UserCode+" and PassWD='"+PassWD+"'";
        MySQL.query(SQL,function(err,row)
        {
            if (err)
                return client.error("登录失败。");

            UserMoney =row.UserMoney;
            NickName=encoding.convert(row.NickName,"utf-8","gb2312").toString();

            FishInfo=Config.CreateFish();

            //创建鱼信息
            for (i = 0; i < Config.get().fishAmount-1; i++)
                FishInfo+=","+Config.CreateFish();
            //创建用户
            SQL="select Money from GameFish where UserCode="+UserCode;
            MySQL.query(SQL,function(err,row)
            {

                if (!row)
                    SQL="insert into GameFish set  UserCode="+UserCode+",Money=0,FishInfo='"+FishInfo+"'";
                else
                    SQL="update GameFish set FishInfo='"+FishInfo+"' where  UserCode="+UserCode;

                MySQL.exec(SQL,function(err,result){
                    if (err)
                        return client.error("登录失败。");
                    client.send(Config.get().MoneyName,FishInfo)
                });
            });

        });
}