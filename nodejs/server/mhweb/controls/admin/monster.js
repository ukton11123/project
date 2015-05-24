var mysql=require("lib/mysql")
exports.show=show;
function show(client)
{
    client.sysSetup=global.sysSetup;
    client.skills=global.baseSkill;
   var name="baseMonster";

    mysql.query("select table_comment from information_schema.tables where TABLE_NAME='"+name+"'",function(err,row){
        client.tableComment=row.table_comment;
        mysql.list("show full fields from "+name,function(err,rows){
            client.rowsfields=rows;
            mysql.list("select *  from "+name+" order by id desc",function(err,rows){
                client.rowsData=rows;
                for (var i in client.rowsData)
                    if(client.rowsData[i].skills)
                        client.rowsData[i].skillsData=client.rowsData[i].skills.split(',');
                client.render("admin/monster")
            })
        });
    });
}
exports.modify=function(client,id)
{

    var name="baseMonster";
    mysql.update(name,{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";
        show(client,name);
    })
}
exports.delete=function(client,id)
{
    var name="baseMonster";
    mysql.exec("delete from "+name +" where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client,name);
    })
}
exports.insert=function(client)
{
    console.log(11111111111111)
    var name="baseMonster";
    mysql.insert(name,client.post,function(err){
        console.log(err)
        client.msg=err?err.code:"新建成功";
        show(client,name);
    })
}