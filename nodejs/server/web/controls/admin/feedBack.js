var mysql=require("lib/mysql")
var func=require("lib/func")
exports.index=function(client)
{
    show(client,0)
}
exports.show=show;
function show(client,page)
{
    client.sysSetup=global.sysSetup;
    client.page=page;
    mysql.list("select userCode,text,time from ZoneChat where Type=2 and TargetID=77000 order by id desc limit "+page+",50",function(err,rows){
        client.rowsData=rows;
        client.render("admin/feedBack")
    });
}
exports.delete=function(client,id)
{
    mysql.exec("delete from ZoneChat where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client);
    })
}