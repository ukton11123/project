var mysql=require("lib/mysql")
exports.get=function (client) {
    var SQL="select State,CurrTime,WinID from GameCars";
    mysql.query(SQL,function(err,row)
    {
        if (err)
            return client.error("操作失败。");
        client.send(row)
    });
}

