var mysql=require("lib/mysql")
exports.show=show;
function show(client,name)
{
    client.sysSetup=global.sysSetup;
    client.tableName=name;
    if (name!="sysServer")
        name='data'+name;

    mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+name+"'",function(err,row){
        client.tableComment=row.table_comment;
        mysql.list("show full fields from "+name,function(err,rows){
            client.rowsfields=rows;
            mysql.list("select *  from "+name+" order by orderid desc",function(err,rows){
                client.rowsData=rows;
                client.render("admin/data")
            })
        });
    });
}
exports.modify=function(client,name,id)
{

    var tableName=name;
    if (tableName!="sysServer")
        tableName='data'+name;


    mysql.update(tableName,{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";
        show(client,name);
    })
}
exports.delete=function(client,name,id)
{

    var tableName=name;
    if (tableName!="sysServer")
        tableName='data'+name;
    mysql.exec("delete from "+tableName +" where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client,name);
    })
}
exports.insert=function(client,name)
{
    var tableName=name;
    if (tableName!="sysServer")
        tableName='data'+name;
    mysql.insert(tableName,client.post,function(err){
        client.msg=err?err.code:"新建成功";
        show(client,name);
    })
}