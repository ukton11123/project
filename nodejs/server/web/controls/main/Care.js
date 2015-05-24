
var MySQL=require("lib/MySQL")
exports.get=function (client,UserCode,TargetCode) {


    var SQL= "select UserCode,TargetCode from ZoneCare where UserCode="+UserCode+" and TargetCode="+TargetCode;
    MySQL.query(SQL,function(err,row)
    {
        if(row)
         return client.send("此用户已经在你的关注列表中。");

        SQL="insert into ZoneCare set UserCode="+UserCode+", TargetCode="+TargetCode+",State=1";
        MySQL.exec(SQL,function(err,Result)
        {
            if (err)
                return client.send("操作失败,处理出错。");
            return client.send("关注成功。");
        })
    });



}