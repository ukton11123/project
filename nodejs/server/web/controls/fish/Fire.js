
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var async=require("async")
exports.get=function (client,UserCode,PassWD,GunType)
{
    function Err(Msg)
    {
        client.error( Msg)
    }
    var GameMoney
    async.waterfall([
        //验证用户
        function (cb) {
            Common.getUserMoney(UserCode, PassWD, function (err,money, type) {

                cb(err)
            })
        },

        //获取游戏币
        function (cb) {
            SQL = "select Money,FishInfo from GameFish where UserCode="+UserCode;
            MySQL.query(SQL, function (err, row) {


                if (row) {
                    GameMoney = row.Money;
                }
                cb(err)
            })
        },

        //开火扣币
        function (cb) {

            if (GameMoney<GunType)
                return  cb(err)

            GameMoney-=GunType;
            SQL="update GameFish set Money="+GameMoney+" where UserCode="+UserCode;
            MySQL.exec(SQL, function (err, result) {

                cb(err)

            });

        }], function (err, values) {
        if (err)
            return client.error( "操作失败")
        client.send(GameMoney);

    })

}