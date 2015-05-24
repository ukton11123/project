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


    mysql.list("show full fields from userStar",function(err,rows){
        client.rowsfields=rows;
        mysql.list("select *  from userStar order by state desc",function(err,rows){
            client.rowsData=rows;
            client.render("admin/star")
        })

    });
}
exports.modify=function(client,id)
{
    mysql.update("userStar",{ID:id},{State:1},function(err){
        client.msg=err?err:"操作成功";

        show(client);
    })
}
exports.delete=function(client,id)
{
    mysql.exec("delete from userStar where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client);
    })
}
exports.insert=function(client)
{
    mysql.insert("userStar",client.post,function(err){
        client.msg=err?err.code:"新建成功";
        show(client);
    })
}
