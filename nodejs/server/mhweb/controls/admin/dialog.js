/**
 * Created by Administrator on 2015/5/6.
 */
var mysql=require("lib/mysql")
exports.show=show;
function show(client)
{
    var name="baseDialog";
    client.sysSetup=global.sysSetup;
    client.tableName=name;
    client.items=global.baseItem;
    client.rounds=global.baseItem;
    client.roles=global.baseRole;


    mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+name+"'",function(err,row){
        client.tableComment=row.table_comment;
        mysql.list("show full fields from "+name,function(err,rows){
            client.rowsfields=rows;
                mysql.list("select *  from "+name+" order by id,partID asc",function(err,rows){
                    client.rowsData=rows;
                    for (var i in client.rowsData)
                        if(client.rowsData[i].items)
                            client.rowsData[i].itemsData=client.rowsData[i].items.split(',');
                    client.render("admin/round")

            })
        });
    });
}
exports.modify=function(client,id)
{
    var name="baseRound";


    mysql.update(name,{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";
        show(client,name);
    })
}
exports.delete=function(client,id)
{
    var name="baseRound";
    mysql.exec("delete from "+name +" where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client,name);
    })
}
exports.insert=function(client)
{
    var name="baseRound";
    mysql.insert(name,client.post,function(err){
        console.log(err)
        client.msg=err?err.code:"新建成功";
        show(client,name);
    })
}