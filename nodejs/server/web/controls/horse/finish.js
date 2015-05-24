var mysql=require("lib/mysql")
var common=require("lib/common")
exports.get=function (client,userCode,passWD) {
    var userMoney,winID,poolMoney,petMoney
    var winMoney=0
    var SQL = "select state,winID,poolMoney from GameHorse";
    mysql.query(SQL, function (er, row) {
        if (row.state != 2)
            return client.error("操作失败。");
        winID= row.winID;
        poolMoney= row.poolMoney;

        //获取下注总数
        SQL="select SUM(Money) petMoney from GameHorsePet where userCode="+userCode;
        mysql.query(SQL, function (err, row) {
            if (err)
                return client.error("操作失败。");
            petMoney=row.petMoney?row.petMoney:0;
            //获取获胜金币
            SQL="select SUM(Money) petMoney,ID,rate from GameHorsePet where userCode="+userCode+" and ID="+winID+"  group by ID";
            mysql.query(SQL, function (er, row) {
                if (row)
                {
                    var rate=row.rate;
                    var money= row.petMoney?row.petMoney:0;
                    winMoney=money*rate;
                }else
                    winMoney=0;
                //获取用户金币
                common.getUserMoney(userCode, passWD, function (err, money) {
                    if (err)
                        return client.error("操作失败。");
                    userMoney=money;
                    client.send(winID,winMoney,petMoney,userMoney, poolMoney)
                });

            });
        });
    });
}