var mysql=require("lib/mysql")
exports.get=function (client,userCode) {
    var SQL="select ID,SUM(Money) PetMoney from GameHorsePet where UserCode="+userCode+" group by ID ";
    mysql.list(SQL,function(err,rows)
    {
        if (err)
            return client.error("操作失败。");
        client.send(rows,global.horseRateArr)
    });
}

