
var MySQL=require("lib/MySQL")
exports.get=function (client,RoomCode) {

    var ServerIP,ServerPort,dataServerRows
    SQL="select ServerIP,ServerPort from SysServer where ServerType=1 order by UserCount limit 1";
    MySQL.query(SQL,function(err,row){
        if (err)
            return client.send("操作失败,处理出错。");

        ServerIP=row.ServerIP
        ServerPort=row.ServerPort
        SQL="select ServerIP,ServerPort,Name from SysServer where ServerType=2";
        MySQL.list(SQL,function(err,rows) {
            if (err)
                return client.send("操作失败,处理出错。");
            dataServerRows=rows

            SQL="select * from roominfo where RoomType>0 and  RoomCode="+RoomCode;
            MySQL.query(SQL,function(err,row) {
                if (err)
                    return client.send( "操作失败,处理出错。");
                client.send(ServerIP,ServerPort,dataServerRows,row)
            });
        });
    })



}