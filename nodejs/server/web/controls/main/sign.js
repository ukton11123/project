
var MySQL=require("lib/MySQL")
var Func=require("lib/Func")
var Common=require("lib/Common")
exports.get=function (client,UserCode) {
    MySQL.query("select SignMonth from sysSetup",function(err,row) {

        if (err)
            return client.error( "操作失败。");
        var SignMonth = row.SignMonth;

        //删除上月签到信息
        SQL = "select SignMonth from sysSetup";
        Month = new Date().getMonth()+1;
        if (SignMonth != Month) {
            MySQL.exec("update sysSetup set SignMonth='" + Month + "'");
            MySQL.exec("update UserInfo set SignInfo='0'");
        }
        // 登录弹出
        SQL = "select SignInfo from UserInfo where UserCode=" + UserCode;
        MySQL.query(SQL, function (err, row) {

            if (err)
                return client.error( "操作失败")
            var SignInfo = row.SignInfo;
            var SingArr = SignInfo.split(',');
            var Day = new Date().getDate()
            if (SingArr.indexOf(Day.toString()) != -1)
                Signed = 1;
            else
                Signed = 0;
            client.send(Signed, SignInfo, Func.now())
        });
    });
}

exports.Sign=function (client,UserCode)
{
// 签到
    MySQL.query("select SignMoney,SignExp,MoneyName from sysSetup",function(err,row)
    {
        var SignMoney = row.SignMoney;
        var SignExp = row.SignExp;
        var MoneyName = row.MoneyName;

        SQL = "select SignInfo,UserMoney from UserInfo where UserCode=" + UserCode;
        MySQL.query(SQL, function (err, row) {
            if (err)
                return client.error( "操作失败")

            var SignInfo = row.SignInfo;
            var UserMoney = row.UserMoney;
            var SingArr = SignInfo.split(',');
            var Day = new Date().getDate()
            if (SingArr.indexOf(Day.toString()) != -1)
                return client.error( "操作失败")
            SignInfo += "," + Day;
            SQL = "update userinfo set Exp=Exp+"+SignExp+",SignInfo='" + SignInfo + "' where UserCode=" + UserCode;
            MySQL.exec(SQL, function (err, result) {
                if (err)
                    return client.error( "操作失败")
                Common.setUserMoney(UserCode, SignMoney + UserMoney);
                Common.saveMoneyRecord(6,'签到', UserCode, SignMoney,  UserMoney + SignMoney)
                client.send(SignExp,MoneyName,SignMoney,UserMoney + SignMoney)

            });
        });
    });
}
