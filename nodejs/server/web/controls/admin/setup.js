var mysql=require("lib/mysql")
exports.index=index;
function index(client)
{
    client.sysSetup=global.sysSetup;
    mysql.list("show full fields from sysSetup",function(err,rows){
        client.rowsfields=rows;
        mysql.query("select *  from sysSetup",function(err,row){
            client.rowData=row;

            client.render("admin/setup")
        })
    });

}
exports.modify=function(client)
{
    console.log(client.post)
    mysql.update("sysSetup",null,client.post,function(err){
        client.msg=err?err.code:"修改成功";

        index(client);
    })
}