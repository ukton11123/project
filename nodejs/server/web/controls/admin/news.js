var mysql=require("lib/mysql")
var func=require("lib/func")
exports.index=function(client)
{
    show(client)
}
exports.show=show;
function show(client)
{
    client.sysSetup=global.sysSetup;


        mysql.list("show full fields from sysNews",function(err,rows){
            client.rowsfields=rows;
            mysql.list("select *  from sysNews order by time desc",function(err,rows){
                client.rowsData=rows;
                client.render("admin/news")
            })

    });
}
exports.modify=function(client,id)
{
    mysql.update("sysNews",{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";

        show(client);
    })
}
exports.delete=function(client,id)
{
    mysql.exec("delete from sysNews where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client);
    })
}
exports.insert=function(client)
{
    client.post.Time=func.now()
    mysql.insert("sysNews",client.post,function(err){
        client.msg=err?err.code:"新建成功";
        show(client);
    })
}

exports.send=function(client,id)
{

    var Text;
    mysql.query("select Title from sysNews where ID="+id,function(err,row) {
        Text = '<font color=&quot;#ff0000&quot;>★系统公告★  ' + row.Title + '</font> (' + func.now() + ')';
        Text = '{"Action":"SysMsg","Data":["' + Text + '"]}';

        mysql.list("select * from sysServer where ServerType=1",function(err,rows){

            for (var i in rows)
            {
                var row=rows[i];
                mysql.exec("insert into  RoomMsg  set ServerIP='"+row.ServerIP+"',ServerPort="+row.ServerPort+",Msg='"+Text+"'")
            }
            client.msg=err?err.code:"发送成功";
            show(client);
        })


    });
}