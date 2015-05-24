var mysql=require("lib/mysql")
var zone=require("./zone")
exports.show=function (client,roomCode)
{
    client.userCode=client.getSession("userCode");
    client.passWD=client.getSession("passWD");
    client.sysSetup=global.sysSetup
    if (client.userCode)
        client.title="聊天室  "+roomCode+"<"+client.userCode+">";
    else
    client.title="聊天室  "+roomCode+"<游客>";
    client.flashParam="UserCode="+client.userCode+"&PassWD="+client.passWD+"&RoomCode="+roomCode;

//读取背景图片
    var sql="select skinID,roomerCode from roominfo where RoomCode="+roomCode;
    mysql.query(sql,function(err,row){

        if (err)
        return client.ShowErr("页面读取出错")
        client.skinID=row.skinID;
        client.roomerCode=row.roomerCode;
        //读取聊天室礼物统计
    var sql="select Sum(reciveMoney) reciveMoney,UserInfo.UserCode,NickName,Face" +
        " from UserInfo,UserMoney where RecordType=1 and UserInfo.UserCode=UserMoney.SenderCode " +
        " and  RoomCode="+roomCode+" group by UserInfo.UserCode  order by Count(reciveMoney) desc limit 20";
        mysql.list(sql, function (err, rows) {
            if (err)
                return client.ShowErr("页面读取出错")

            client.giftData=rows;
            zone.userChat(client,client.roomerCode,0,function(err)
            {

                client.render("room");
            })

        })
    })


}