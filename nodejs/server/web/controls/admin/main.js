var mysql=require("lib/mysql")
var func=require("lib/func")
exports.index=function(client)
{
    client.sysSetup=global.sysSetup;
    mysql.query("select Count(UserCode) userCount,SUM(UserMoney) moneyCount from userinfo",function(err,row){
        client.userCount=row.userCount;
        client.moneyCount=row.moneyCount;

        mysql.query("select Count(RoomCode) roomCount  from roominfo",function(err,row){
            client.roomCount=row.roomCount;
            mysql.list("select -SUM(SendMoney) SendMoney,RecordName  from UserMoney group by RecordName",function(err,rows){
                client.rowsMoney=rows;

                mysql.list("select userCode,text,time from ZoneChat where Type=2 and TargetID=77000 order by id desc limit 20",function(err,rows){
                    for(var i in rows)
                    rows[i].time=func.timeToString(rows[i].time*1000)
                    client.rowsFeedback=rows;
                    client.render("admin/main")
                });
            });
        })
    });

}