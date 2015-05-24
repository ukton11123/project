var mysql=require("lib/mysql")
var async = require("async")
exports.show=show;
var name="baseTask";
function show(client)
{
    client.sysSetup=global.sysSetup;
    client.tableName=name;
    client.items=global.baseItem;
    client.rounds=global.baseRound;
    mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+name+"'",function(err,row){
        client.tableComment=row.table_comment;
        mysql.list("show full fields from "+name,function(err,rows){
            client.fields=rows;
            client.fields.selectData={};
            for(var i in rows)
                if(rows[i].Comment)
                {
                    if (rows[i].Comment.substr(0,2)=="S_") {
                        var selectName=rows[i].Comment.split("/")[0];
                        client.fields.selectData[selectName] = rows[i].Comment.split("/")[1].split(",");
                        client.fields[i].Comment=selectName;
                    }
                }

                mysql.list("select *  from "+name+" order by id asc",function(err,rows){
                    client.rows=rows;
                    async.eachSeries(rows,function(row,callback)
                    {
                        mysql.list("select baseItem.quality,baseItem.name,baseItemDrop.amount,baseItemDrop.rate from " +
                            "baseItemDrop,baseItem where baseItemDrop.itemID=baseItem.ID and baseItemDrop.type=1 and " +
                            "baseItemDrop.targetID="+row.ID,function(err,rows) {
                            row.itemDrop=rows;
                            callback();
                        });
                    },
                    function(err){

                            client.render("admin/task")
                    });



            })
        });
    });
}
exports.modify=function(client,id)
{

    mysql.update(name,{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";
        show(client,name);
    })
}
exports.delete=function(client,id)
{
    mysql.exec("delete from "+name +" where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client,name);
    })
}
exports.insert=function(client)
{

    mysql.insert(name,client.post,function(err){
        console.log(err)
        client.msg=err?err.code:"新建成功";
        show(client,name);
    })
}