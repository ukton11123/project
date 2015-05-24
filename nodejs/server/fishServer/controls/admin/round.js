var mysql=require("lib/mysql")
var async = require("async")
exports.show=show;
function show(client)
{
    var name="baseRound";
    client.sysSetup=global.sysSetup;
    client.tableName=name;
    client.items=global.baseItem;
    client.parts=global.basePart;
    client.rounds=global.baseRound;
    client.roles=global.baseRole;
    client.dialogs=global.baseDialog;

        mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+name+"'",function(err,row){
            client.tableComment=row.table_comment;
            mysql.list("show full fields from "+name,function(err,rows){
                client.fields=rows;
                mysql.list("select *  from "+name+" order by id,partID asc",function(err,rows){
                    client.rows=rows;
                    async.eachSeries(rows,function(row,callback)
                        {
                            mysql.list("select baseItem.quality,baseItem.name,baseItemDrop.amount,baseItemDrop.rate from " +
                                "baseItemDrop,baseItem where baseItemDrop.itemID=baseItem.ID and baseItemDrop.type=2 and " +
                                "baseItemDrop.targetID="+row.ID,function(err,rows) {
                                row.itemDrop=rows;
                                callback();
                            });
                        },
                        function(err){

                            client.render("admin/round")
                        });

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