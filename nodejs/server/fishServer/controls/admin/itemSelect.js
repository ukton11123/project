var mysql=require("lib/mysql")
var async = require("async")
exports.show=show;
function show(client,targetID,type)
{
    var tableName="baseItem"
    client.sysSetup=global.sysSetup;
    client.targetID=targetID;
    client.type=type;
    mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+tableName+"'",function(err,row){
        client.tableComment=row.table_comment;
        mysql.list("show full fields from "+tableName,function(err,rows){
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
            mysql.list("select *  from baseItem order by id desc",function(err,rows){
                client.rows=rows;

                async.eachSeries(rows,function(row,callback)
                    {
                        mysql.query("select amount,rate from  baseItemDrop where type="+type+" and targetID="+targetID+" and itemID="+row.ID,function(err,row2) {
                            if (row2)
                                row.itemDrop=row2;
                            callback();
                        });
                    },
                    function(err){
                        client.render("admin/itemSelect")
                    });
            })
        });
    });
}

exports.update=function(client,targetID,type,str)
{
    mysql.exec("delete from baseItemDrop where targetID="+targetID+" and type="+type,function()
    {


        var arr=str.split(";");

        async.eachSeries(arr,function(str,callback)
            {
                var info=str.split(":");
                var itemID=info[0];
                var amount=info[1];
                var rate=info[2];
                var SQL="insert into baseItemDrop set amount="+amount+",rate="+rate+",targetID="+targetID+",type="+type+",itemID="+itemID;
                mysql.exec(SQL)
                callback();

            },
            function(err){
                show(client,targetID,type)
            });
    })
}