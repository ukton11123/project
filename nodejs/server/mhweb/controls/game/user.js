var mysql = require("lib/mysql");
exports.login = function (client, userName,passWD) {

    var SQL = "select * from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");
        client.send(row)
    });
}
exports.get = function (client, userName,passWD) {
    var SQL = "select * from userInfo where userName='" + userName + "'  and passWD='" + passWD + "'";
    mysql.query(SQL, function (err, row) {
        if (err)
            return client.error("操作失败。");
        client.send(row)
    });
}