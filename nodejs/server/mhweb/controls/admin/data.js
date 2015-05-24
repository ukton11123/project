var mysql=require("lib/mysql")
var func=require("lib/func")
exports.show=show;
function show(client,name)
{
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
            mysql.list("select *  from "+name+" order by id desc",function(err,rows){
                client.rows=rows;
                for(var i in rows)
                    if (rows[i].items)
                        rows[i].itemsJson=JSON.parse(rows[i].items)
                client.render("admin/data")
            })
        });
    });
}
exports.modify=function(client,name,id)
{

    var tableName=name;


    mysql.update(tableName,{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";
        show(client,name);
    })
}
exports.delete=function(client,name,id)
{
    mysql.exec("delete from "+name +" where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client,name);
    })
}
exports.insert=function(client,name)
{
    mysql.insert(name,client.post,function(err){
        console.log(err)
        client.msg=err?err.code:"新建成功";
        show(client,name);
    })
}
exports.sendMail=function(client,id)
{
    mysql.query("select *  from sysMail where id="+id,function(err,row) {
        mysql.list("select userName  from userInfo", function (err, rows) {

            for (var i in rows)
                mysql.exec(" insert into userMail set  time='"+func.now()+"',title='"+row.title+"'," +
                    "text='"+row.text+"',items='"+row.items+"',sender='系统邮件',userName='" + rows[i].userName + "',mailID=" + id)
            client.msg = err ? err : "邮件发送成功";
            show(client, "sysMail");
        })
    })
}
