var mysql=require("lib/mysql")
var func=require("lib/func")
exports.index=function(client)
{
    client.render("admin/main")

}