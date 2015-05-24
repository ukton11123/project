
var MySQL=require("lib/MySQL")
var Common=require("lib/Common")
var Config=require("./Config")
var async=require("async")
exports.get=function (client,UserCode,PassWD,GunType,FishID)
{
    function Err(Msg)
    {
        client.error( Msg)
    }
    var GameMoney,FishInfo,Price,FishType

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
                    FishInfo = row.FishInfo;
                    if (GameMoney<GunType*2)
                    err=1
                }
                cb(err)
            })
        },

        //捕鱼
        function (cb) {


           var FishArr = FishInfo.split(',');

            if (FishID>=FishArr.length)
                return cb(1)

            FishType=FishArr[FishID];

            //判断是否可以捕获鱼 Hard=>难度
            var FishPrice=Config.get().fishPrice;


            var Num=Math.random()* FishPrice[FishType-1]*Config.get().hard;

            if (parseInt(Num)>parseInt(GunType))
                return client.end()

            Price=FishPrice[FishType-1];
            GameMoney+=Price;

            //击中 ,增加金币,创建新鱼
            FishType=Config.CreateFish()

            FishArr[FishID]=FishType;
            FishInfo=FishArr.join(",");
            SQL="update GameFish set Money="+GameMoney+",FishInfo='"+FishInfo+"' where UserCode="+UserCode;
            MySQL.exec(SQL, function (err, result) {

                cb(err)
            });


        }], function (err, values) {
        if (err)
            return client.error( "操作失败")
        else
        client.send(FishID,Price,GameMoney,FishType);

    })

}