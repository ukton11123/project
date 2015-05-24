
var mySQL=require("lib/mySQL")
var func=require("lib/func")
var Common=require("lib/Common")
exports.get=function (client)
{
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    if (!userCode && !passWD)
    return;
    var ExpAdd=global.sysSetup.ExpAdd;
    var ExpTime=global.sysSetup.ExpTime*60;
    SQL = "select Exp,Level from UserInfo where "+func.time()+"-LastAddTime>="+ExpTime+"-3 and userCode="+userCode+"  and passWD='"+passWD+"'";
    mySQL.query(SQL,function(err,row) {
        if (err)
            return client.error("操作失败。");
        row.Exp += ExpAdd;
        //检测升级
        Levelup = false;
        //检测升级
        if (row.Exp > row.Level * row.Level * 1000)
        {
            row.Exp -= row.Level * row.Level * 1000;
            row.Level += 1;
            Levelup = true;
            Common.saveToZone(userCode, "恭喜升级!当前等级"+row.Level+"级。",0);
        }
        SQL="update UserInfo set Exp="+row.Exp+",Level="+row.Level+",LastAddTime="+func.time()+" where userCode="+userCode;
        mySQL.exec(SQL,function(err,Result){
            if (err)
                return client.error("操作失败。");
            client.send(ExpAdd,Levelup);
        })

    });




}