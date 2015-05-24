
var MySQL=require("lib/MySQL")
exports.get=function (client,UserCode,RoomCode) {

    var SQL= "select UserCode from UserRoom where  RoomGroup=2 and UserCode="+UserCode+" and RoomCode="+RoomCode;
    MySQL.query(SQL,function(err,row)
    {
        if(row)
            return client.send("此聊天室已经在你的收藏列表中。");

        SQL="insert into userroom set UserCode="+UserCode+", RoomCode="+RoomCode+",RoomGroup=2";
        MySQL.exec(SQL,function(err,result)
        {
            if (err)
                return client.send("操作失败,处理出错。");
            return client.send("收藏成功。");
        })
    });



}