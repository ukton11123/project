
var mysql=require("lib/mysql")
var func=require("Lib/Func")
exports.OnData=function (client,userName,PassWD)
{
    const  Msg_Error = "数据处理出错。";
    const  Msg_Error2 = "用户名或密码错误。";
    var SQL="select userName,nickName,money,level from UserInfo where userName='" + userName+"' and PassWD='"+PassWD+"'";
    mysql.query(SQL,function (err, row){
                if (!row)
                    return client.send("error", Msg_Error2);
                if (err)
                return client.send("error", Msg_Error);

                client.send("login", row);

            });
}
