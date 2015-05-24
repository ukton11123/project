var async=require("async")
var common=require("lib/common")
var mysql=require("lib/mysql")

function GetBao()
{
    //随机取宝贝
    var Count=global.dataBao.length;
    var index= parseInt(Math.random()*Count);
    var item=global.dataBao[index];
    //根据中奖几率判断是否能获取此宝贝
    index= Math.random()*10000;
    if (index>item.Rate)
        return GetBao();
    return item;
}
exports.get=function (client,userCode,passWD,roomCode)
{
    var MSG_Error = "挖宝失败，处理出错。";
    var MSG_MoneyError = "挖宝失败，余额不足。";
    var MSG_RankError = "挖宝失败，您所在的用户组无此权限。";
    var userMoney,userType,baoPrice,baoSend
    var price=global.sysSetup.BaoPrice
    var bao
    var nickName,face;
    async.waterfall([
        //验证用户
        function (cb) {
            var SQL="select nickName,userMoney,face from userinfo where userCode="+userCode+" and passWD='"+passWD+"'";
            mysql.query(SQL,function(err,row )
            {
                userMoney=row.userMoney
                nickName=row.nickName
                face==row.face

                cb(err)
            });

        },
        //获取挖宝信息
        function (cb)
        {

            if(price>userMoney)
                return client.error(MSG_MoneyError)


            bao = GetBao()
            if (!bao)
                return client.error(MSG_Error)
            baoPrice = bao.Price;
            baoSend = bao.Send;
            cb();
        },
        //扣除发送者金币
        function (cb) {

            userMoney = userMoney - price + baoPrice;
            common.setUserMoney(userCode, userMoney,function(err){

                cb(err)

            });
        },
        //保存交易记录,广播信息
        function (cb) {

            common.saveMoneyRecord(2, "挖宝",userCode,baoPrice - price,  userMoney)
            var Str="在挖宝游戏中获得"+bao.Name+"，价值"+global.sysSetup.MoneyName+bao.Price;
            client.send(userMoney,baoPrice - price,bao.Img,Str);
            //服务器广播
            if (baoSend==1)
            {
                common.saveToZone(userCode, Str,roomCode);
                Str=common.makeHornHead(roomCode,userCode,nickName,face)+Str
                common.saveServerMsg(0,0,"Chat",3,Str,0,0);
            }
            cb()

        }], function (err, values) {
        if (err)
            client.error(MSG_Error);


    })
}