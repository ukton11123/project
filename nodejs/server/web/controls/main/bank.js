var mysql=require("lib/mysql")
var common=require("lib/common")
exports.index=function (client) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    var SQL= "select bankMoney,userMoney,nickName from userInfo where  userCode="+userCode+" and  PassWD='"+passWD+"'";
    mysql.query(SQL,function(err,row)
    {
        if (err)
            return client.showErr("操作失败");
        client.sysSetup=global.sysSetup;
        client.bankMoney=row.bankMoney?row.bankMoney:0
        client.myMoney=row.userMoney
        client.render("main/bank")
    })
}

exports.convert=function (client,type,money,payPassWD) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    var userMoney,bankMoney,convertMoney;
    var SQL= "select bankMoney,userMoney,payPassWD from userInfo where  userCode="+userCode+" and  PassWD='"+passWD+"'";// and payPassWD='"+payPassWD+"';
    mysql.query(SQL,function(err,row)
    {
        if (err)
            return client.error("兑换失败");

        if (row.payPassWD)
            if (row.payPassWD!=payPassWD)
            return client.error("支付密码不正确");

        if (type==1)
        {
            if (row.userMoney<money)
                return client.error("余额不足");
            convertMoney=parseInt(money)


        }else
        {
            if (row.bankMoney<money)
                return client.error("余额不足");
            convertMoney=-parseInt(money)
        }
        userMoney=row.userMoney-parseInt(convertMoney)
        bankMoney=row.bankMoney+parseInt(convertMoney)

        var SQL= "update userInfo set  bankMoney="+bankMoney+",userMoney="+userMoney+" where  userCode="+userCode;

        mysql.exec(SQL,function(err){
            if (err)
                return client.error("兑换失败");
            common.saveMoneyRecord(30,"银行兑换",userCode,convertMoney,userMoney);
            client.send("兑换成功")
        })

    })
}
exports.outBank=function (client,money,payPassWD) {

}