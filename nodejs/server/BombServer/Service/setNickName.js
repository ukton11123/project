/**
 * Created by Administrator on 2014/11/9 0009.
 */
var mysql=require("lib/mysql")
exports.OnData=function (client,userName,nickName)
{

    var SQL="update userInfo   set  nickName='"+nickName+"' where   userName='"+userName+"'";

        mysql.exec(SQL,function (err){
            if (err)
                return client.send("error", "设置昵称失败,处理出错。");
            client.send("setNickName",nickName);
        })
}