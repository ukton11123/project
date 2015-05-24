/**
 * Created by Administrator on 2014/11/9 0009.
 */
var mysql=require("lib/mysql")
exports.OnData=function (client,userName,passWD)
{
    var SQL="select userName from  userInfo where  userName='"+userName+"'";
    mysql.query(SQL,function (err,row){
        if (row)
            return client.send("error", "注册失败,用户名被占用。");

        var SQL="insert into userInfo set userName='"+userName+"',passWD='"+passWD+"'";
        mysql.exec(SQL,function (err){
            if (err)
                return client.send("error", "注册失败,处理出错。");
            client.send("reg");
        })
    });
}