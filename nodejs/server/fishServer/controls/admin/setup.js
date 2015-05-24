var mysql=require("lib/mysql")
exports.index=index;
function index(client)
{
    client.sysSetup=global.setup;
    mysql.list("show full fields from setup",function(err,rows){
        client.rowsfields=rows;
        mysql.query("select *  from setup",function(err,row){
            client.rowData=row;

            client.render("admin/setup")
        })
    });

}
exports.modify=function(client)
{
    console.log(client.post)
    mysql.update("setup",null,client.post,function(err){
        client.msg=err?err.code:"修改成功";

        index(client);
    })
}