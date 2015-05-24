var mysql=require("lib/mysql")
var common=require("lib/common")
exports.get=function (client,userCode,passWD,petID,petMoney) {

    var state, userMoney;
    if (petMoney < 0)
        return client.error("操作失败。");
    if (petID < 0 || petID > 7)
        return client.error("操作失败。");

    var SQL = "select state from GameCars";
    mysql.query(SQL, function (er, row) {
        state = row.state;
        if (state != 0)
            return client.error("比赛已经开始,无法竞猜。");
        //获取用户金币
        common.getUserMoney(userCode, passWD, function (err, money) {
            if (err)
                return client.error("操作失败。");
            if (money < petMoney)
                return client.error("操作失败,余额不足。");
            userMoney = money-petMoney;
            //扣除用户下注
            common.setUserMoney(userCode, userMoney, function (err) {
                if (err)
                    return client.error("操作失败。");
                //保存交易记录
               // common.saveMoneyRecord(10, "车行下注", userCode, -petMoney, userMoney);
                common.saveUncMoneyRecord(15, "车行下注", userCode, -petMoney, userMoney);
                //创建下注
                var Data = {userCode: userCode, ID: petID, Money: petMoney}
                mysql.insert("GameCarsPet", Data, function (err) {
                    if (err)
                        return client.error("操作失败。");
                    client.send(userMoney, petMoney, petID)
                });

            })
        })
    });

}