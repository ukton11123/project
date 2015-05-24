var mysql=require("lib/mysql")
var func=require("lib/func")
var common=require("lib/common")
exports.index=function (client) {

    show(client,1)

}
exports.show=show;
function show(client,kind) {
    client.kind=kind
    client.sysSetup=global.sysSetup
    client.dataMall=global.dataMall
    var userCode=client.getSession("userCode")

    var passWD=client.getSession("passWD")

    if (userCode)
    {
        mysql.query("select nickName,userMoney from userinfo where usercode="+userCode+" and passWD='"+passWD+"'",function(err,row){

            client.nickName=row.nickName
            client.userMoney=row.userMoney
            client.myCode=userCode
            mysql.query("select DataMall.ID,(BuyTime*1000+PropsLimit*Amount*24*60*60*1000) Time,Img,Kind,Name,Amount from userProps,DataMall where DataMall.ID = UserProps.propsID and usercode="+userCode+" and Kind="+kind,
                function(err,row){
                    if (row)
                        row.Time=func.timeToString(row.Time)
                    client.userProps=row;
                    client.render("mall")
                })

        })
    }
    else
        client.render("mall")
}
exports.buy=function(client,id)
{
    function getProps(id)
    {
        for (var i in global.dataMall)
            if (global.dataMall[i].ID==id)
                return global.dataMall[i]
    }

    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");

    var props=getProps(id)
    if (!props)
        return client.end("购买失败。");
    if(!userCode)
        return client.end("购买失败。");
//获取用户金币
    common.getUserMoney(userCode,passWD,function(err,userMoney,userType){

        if (err)
            return client.end("购买失败。");
        if (props.Price>userMoney)
            return client.end("购买失败，余额不足。");
        userMoney-=props.Price;
        //扣除用户KB
        var SQL="update userinfo set UserMoney="+userMoney;
        if (props.Type==1 && props.Rank)
            SQL+=",UserType="+props.Rank;
        SQL+=" where UserCode="+userCode;

        mysql.exec(SQL,function(err,result){
            if (err)
                return client.end("购买失败。");

            //增加交易记录
            common.saveMoneyRecord(5,"购买道具"+props.Name,userCode,-props.Price,userMoney)
            //添加用户道具
            SQL="select ID from UserProps where UserCode="+userCode+" and propsID="+props.ID;
            mysql.query(SQL,function(err,row){
                if (row)
                    SQL="update UserProps  set Amount=Amount+1 where ID="+row.ID;
                else
                {

                    mysql.exec("delete from userprops where UserCode="+userCode+" and Kind="+props.Type);
                    SQL="insert UserProps  set Amount=1,UserCode="+userCode+",propsID="+props.ID+",Kind="+props.Type +
                        ",BuyTime="+func.time();
                }

                mysql.exec(SQL,function(err){
                    if (err)
                        return client.end("购买失败。");


                    common.saveToZone(userCode,"购买了道具 "+props.Name+" <img width=\"100\" height=\"67\" src=\"/public/img/Mall/"+props.Img+"\"/>。",0)
                    client.end("道具 "+props.Name+" 购买成功，花费 "+global.sysSetup.MoneyName+props.Price +"个。");
                })
            })
        })
    })


}