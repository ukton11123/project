
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var Config=require("./Config")
var async=require("async")
exports.get=function (client,userCode,PassWD,Type,Money)
{

    function Err(Msg)
    {
        client.error( Msg)
    }
    Money=parseInt(Money)
    var GameMoney,UserMoney
    async.waterfall([
        //获取金币
        function (cb) {

            Common.getUserMoney(userCode, PassWD, function (err,money, type) {
                UserMoney = money;
                cb(err)
            })
        },


        //获取游戏币
        function (cb) {
            SQL = "select Money from GameFish where userCode="+userCode;
            MySQL.query(SQL, function (err, row) {
                if (row)
                    GameMoney = row.Money;
                cb(err)
            })
        },

        //兑换
        function (cb) {

            if (Type == 1) {
                GameMoney +=Money;
                Money = Money * Config.get().rate;

                if (UserMoney < Money)
                    Err("余额不足。")
                Money=-Money;
                UserMoney += Money;

            }
            if (Type == 2) {

                if (GameMoney < parseInt(Money / Config.get().rate))
                    Err("游戏币余额不足。");
                UserMoney += Money;
                GameMoney -=  parseInt(Money / Config.get().rate);

            }
            cb()
        },
        //更改金币
        function (cb) {

            Common.setUserMoney(userCode, UserMoney, function (err, result) {
                cb(err)
            })
        },
        //保存交易记录
        function (cb) {
            Common.saveUncMoneyRecord(28, "兑换游戏币-捕鱼", userCode, Money, UserMoney,function(err,result) {
            //Common.saveMoneyRecord(22, "兑换游戏币-捕鱼", userCode, Money, UserMoney,function(err,result) {
                cb(err);
            })
        },
        //增减游戏币
        function (cb) {

            SQL = "update  GameFish set  Money=" + GameMoney + " where userCode=" + userCode;

            MySQL.exec(SQL, function (err, result) {
                cb(err)
            })
        }], function (err, values) {
            if (err)
                return Err("操作失败");

            client.send(UserMoney,GameMoney);

        })
}