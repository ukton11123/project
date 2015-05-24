
var mySQL=require("lib/mySQL")

exports.call=function (client,cb) {

    client.totalCount=0;
    SQL="select RoomType2,sum((select count(UserCode) from RoomUser where RoomUser.RoomCode=roominfo.RoomCode)) Count from roominfo group by RoomType2";
    mySQL.list(SQL,function(err,rows){
        for (var i in rows)
        {
            for (var j in global.dataRoomType)
                if (rows[i].RoomType2==global.dataRoomType[j].ID)
                    global.dataRoomType[j].userCount=rows[i].Count
            client.totalCount+=rows[i].Count;
        }
        cb(err);
    })


}
