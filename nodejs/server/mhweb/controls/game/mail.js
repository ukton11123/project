/**
 * Created by Administrator on 2015/5/11.
 */
var mysql = require("lib/mysql");
var data = require("../data");
var common = require("../common");
var async = require("async")
exports.get = function (client, userName) {

    var props=global.baseProps;
    var SQL = "select * from userMail where userName='" + userName+"'";
    mysql.list(SQL, function (err, rows) {
        for (var i in rows)
        if (rows[i].items)
            rows[i].items=JSON.parse(rows[i].items)
        client.send(rows);
    });
}
//设置邮件已读
exports.read = function (client, id) {


    mysql.exec("update userMail set readed=1 where id="+id);
}
//删除邮件
exports.delete = function (client, userName,passWD,id) {
    var SQL = "select ID from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";

    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
        var SQL="delete from userMail  where readed=1 and (geted=1 and items<>'') ";
        if (id!=0)
            SQL+=" and id=" + id
        mysql.exec(SQL,function(err){
            client.send();
        });

    });

}
//获取附件
exports.getItem = function (client, userName,passWD,id) {
    var SQL = "select ID from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";

    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败");
        var SQL = "select * from userMail where userName='" + userName+"' and ID="+id;
        mysql.query(SQL, function (err, row) {
            if (err)
                return client.error("操作失败");
            //是否接收完毕
            if (row.geted)
               return client.error("附件已经接收");
            mysql.exec("update userMail set geted=1 where id="+id);
            //增加用户物品
            if(row.items)
            row.items=JSON.parse(row.items)
            common.addItem(userName, row.items)
            client.send(row.items)

        });
    })
}