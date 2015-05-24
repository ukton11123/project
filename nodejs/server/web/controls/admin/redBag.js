var mysql=require("lib/mysql")
var func=require("lib/func")
var Common=require("lib/common")
var MySQL=require("lib/MySQL")
exports.index=function(client)
{
    show(client)
}
exports.show=show;
function show(client)
{
    client.sysSetup=global.sysSetup;


    mysql.list("show full fields from sysRedBag",function(err,rows){
        client.rowsfields=rows;
        mysql.list("select *  from sysRedBag order by ID desc",function(err,rows){
            client.rowsData=rows;
            client.render("admin/redBag")
        })

    });
}
exports.modify=function(client,id)
{
    mysql.update("sysRedBag",{ID:id},client.post,function(err){
        client.msg=err?err:"修改成功";

        show(client);
    })
}
exports.delete=function(client,id)
{
    mysql.exec("delete from sysRedBag where ID="+id,function(err){
        client.msg=err?err:"删除成功";
        show(client);
    })
}
exports.insert=function(client)
{
    mysql.insert("sysRedBag",client.post,function(err){
        client.msg=err?err.code:"新建成功";
        show(client);
    })
}
exports.sendRedBag=sendRedBag;
function sendRedBag(money)
{

    var redBagID;
    MySQL.exec("Insert into UserRedBag (UserCode,RoomCode,Money,totalMoney) VALUES(0,0,"
        + money + "," + money + ")", function (err, Result) {
        //读取插入记录的ID
        MySQL.query("select ID from UserRedBag where UserCode=0 order by id desc limit 1",function(err,Row)
        {

            redBagID=Row.ID;
            Common.saveServerMsg(0,0, "sendRedBag", redBagID,0,money);

        });

    });
}
exports.send=function(client)
{
    //添加进入数据库
    sendRedBag(client.post.money);
    client.msg="发送成功";
    show(client);


    }