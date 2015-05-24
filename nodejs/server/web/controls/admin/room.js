var mysql=require("lib/mysql")
exports.index=function (client)
{


    show(client)

}
exports.show=show;
function show(client)
{
    client.roomCode=0
    if(client.post)
        client.roomCode=client.post.RoomCode?client.post.RoomCode:0;

    client.sysSetup=global.sysSetup;
    mysql.list("show full fields from roomInfo",function(err,rows){
        client.rowsfields=rows;
        mysql.query("select *  from roomInfo where roomCode="+client.roomCode,function(err,row){
            if (!row && client.roomCode)
                client.msg="没有查询到此房间数据"
            client.rowData=row;
            client.dataRoomType=global.dataRoomType;
            client.dataMall=global.dataMall;
            client.render("admin/room")
        })
    })

}
exports.modify=function(client,roomCode)
{
    mysql.update("roomInfo",{roomCode:roomCode},client.post,function(err){
        client.msg=err?err.code:"修改成功";

        show(client);
    })
}
exports.insert=function(client)
{
    mysql.insert("roomInfo",client.post,function(err){
        client.msg=err?err.code:"创建成功";

        show(client);
    })
}