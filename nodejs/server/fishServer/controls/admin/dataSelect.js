var mysql=require("lib/mysql")
exports.show=show;
function show(client,ID,datas)
{
    var tableName="baseItem";
    client.sysSetup=global.setup;
    client.ID=ID;
    client.datas=datas?JSON.parse(datas):null;
    client.tableName=tableName;
    client.items=global.baseItem;
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
            mysql.list("select *  from "+tableName+" order by id desc",function(err,rows){
                client.rows=rows;
                for (var i in rows)
                {
                    for (var j in client.datas)
                        if(rows[i].ID==client.datas[j].id)
                        {
                            rows[i].checked="checked"
                            rows[i].rate=client.datas[j].rate
                            rows[i].amount=client.datas[j].amount
                        }
                    if (rows[i].items)
                        rows[i].itemsJson=JSON.parse(rows[i].items)
                }

                client.render("admin/dataSelect")
            })

        });
    });
}