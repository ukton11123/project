
var mySQL=require("lib/mySQL")
var func=require("lib/func")
exports.call=call;
function call(userCode,cb) {


    SQL= "select userCode,level,userType,nickName,face,sex,userExplain,exp,(level*level*1000) needExp," +
        "(select name from dataRank where dataRank.ID=userInfo.UserType) rankName," +
        "(select Img from DataRank where DataRank.ID=UserInfo.UserType) rankImg from UserInfo where userCode="+userCode;
    mySQL.query(SQL,function(err,row)
    {
        return cb(err?"操作失败":null,row);
    })
}

exports.get=function(client,userCode) {

    call(userCode, function (err, row) {

        if (err)
            return client.error(err)

        client.send(row);
    })
}
exports.getModify=function(client,userCode) {
    var userCode=client.getSession("userCode");
    call(userCode, function (err, row) {
        if (err)
            return client.error(err)
        client.dataUser=row;
        client.render("main/modify");
    })
}

exports.modify=function(client,nickName,explain,sex,face) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    SQL = "select userCode from UserInfo where userCode="+userCode+" and  PassWD='"+passWD+"'";
    mySQL.query(SQL,function(err,row)
    {
        if (err)
            return client.error("修改资料失败。")
        SQL = "update  UserInfo SET nickName='"+nickName+"',face='"+face+"',sex="+sex+",Userexplain='"+explain+"' where userCode="+userCode;
        mySQL.exec(SQL,function(err,Result){
            if (err)
                return client.error("修改资料失败。")
            client.send("修改资料成功。");
        })
    })
}

exports.modifyPWD=function(client,oldPassWD,newPassWD) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    SQL = "select userCode from UserInfo where userCode="+userCode+" and  PassWD='"+oldPassWD+"'";
    mySQL.query(SQL,function(err,row)
    {
        if (err)
            return client.error("修改密码失败,原密码不正确。")
        SQL = "update  UserInfo SET PassWD='"+newPassWD+"' where userCode="+userCode;
        mySQL.exec(SQL,function(err,result){
            if (err)
                return client.error("修改密码失败。")
            client.send("修改密码成功。");
        })
    })
}

exports.modifyPayPWD=function(client,oldPassWD,newPassWD) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    SQL = "select userCode,PayPassWD from UserInfo where userCode="+userCode+" and  PassWD='"+passWD+"'";

    mySQL.query(SQL,function(err,row)
    {
        if (err)
            return client.error("修改支付密码失败,原密码不正确。")
        if (row.PayPassWD)
        if (row.PayPassWD!=oldPassWD)
            return client.error("修改支付密码失败,原密码不正确。")

        SQL = "update  UserInfo SET PayPassWD='"+newPassWD+"' where userCode="+userCode;
        mySQL.exec(SQL,function(err,result){
            if (err)
                return client.error("修改支付密码失败。")
            client.send("修改支付密码成功。");
        })
    })
}

exports.modifyAQ=function(client,question,answer) {
    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    SQL = "select userCode,question,Answer from UserInfo where userCode="+userCode+" and  PassWD='"+passWD+"'";
    mySQL.query(SQL,function(err,row)
    {
        if (err)
            return client.error("设置密保失败。")
        if (row.Question || row.Answer )
            return client.error("此账号已经设置密码保护，无法重复设置。")
        SQL = "update  UserInfo SET Answer='"+answer+"',question='"+question+"' where userCode="+userCode;
        mySQL.exec(SQL,function(err,result){
            if (err)
                return client.error("设置密保失败。")
            client.send("设置密保成功。");
        })
    })

}


exports.myProps=function(client) {
    var userCode=client.getSession("userCode");
    SQL = "select PropsID,(BuyTime*1000+PropsLimit*Amount*24*60*60*1000) Time,Kind,Img,Name,(PropsLimit*Amount) PropsLimit,Amount from UserProps join UserInfo,DataMall " +
        "where  UserProps.PropsID=DataMall.ID and UserProps.userCode=UserInfo.userCode and UserProps.userCode="+userCode;
    mySQL.list(SQL,function(err,rows)
    {
        if (err)
            return client.error("操作失败")
        for (var i in rows)
            rows[i].Time=func.timeToString(rows[i].Time);
        client.rowsProps=rows;
        client.render("main/myProps")
    })


}

exports.moneyRecord=function (client,page) {
    if(!page)
        page=0;
    var userCode=client.getSession("userCode");
    var pageSize = 8;
    var QueryText = "(SenderCode="+userCode+" or TargetCode="+userCode+")";

        var Index = pageSize * page;

        SQL = "select senderCode,targetCode,sendMoney,reciveMoney,recordName,senderLess,targetLess,dealTime from UserMoney "
            +"where  "+QueryText+"  order by ID  desc  limit "+Index+","+pageSize;
        mySQL.list(SQL, function (err, rows) {
            if (err)
                return client.error("操作失败")
            for(var i in rows)
            {
                if (rows[i].senderCode==userCode)
                {
                    rows[i].target=rows[i].targetCode==0?"系统":rows[i].targetCode
                    rows[i].money=rows[i].sendMoney
                    rows[i].moneyLess=rows[i].senderLess
                }
                else
                {
                    rows[i].target=rows[i].senderCode==0?"系统":rows[i].senderCode
                    rows[i].money=rows[i].reciveMoney
                    rows[i].moneyLess=rows[i].targetLess

                }
                rows[i].dealTime=func.timeToString(rows[i].dealTime)
            }

            client.page=page;
            client.rowsMoney=rows;
            client.render("main/moneyRecord")
        });

}

exports.findPWD=function (client,step,userCode,answer,passWD) {

    // 第一步,验证号码,获取提示问题
    if (step == 1)
    {
        SQL = "select Question from UserInfo where userCode="+userCode;
        mySQL.query(SQL, function (err, row) {
            if (err)
                return client.error('找回密码失败。')

            if (!row.Question)
                return client.error('找回密码失败,可能此号码没有设置密保。')
            client.send(step,row.Question)
        })

    }
    // 第二步,验证问题答案,提示重置密码
    if (step == 2)
    {

        SQL = "select Question from UserInfo where userCode="+userCode+" and answer='"+answer+"'";
        mySQL.query(SQL, function (err, row) {
            if (err)
                return client.error( '找回密码失败,密保答案不正确。')

            client.send( step, "")
        });
    }
    // 第三步,重置密码和密保,完成
    if (step ==3)
    {
        SQL = "update UserInfo  set passWD='"+passWD+"' where userCode="+userCode;
        mySQL.exec(SQL, function (err, Result)
        {
            if (err)
                return client.error('重置密码失败。')
            client.send(step,"密码重置成功,请妥善保管您的新密码。")
        });
    }
}

exports.myInfo=function (client) {
    client.sysSetup=global.sysSetup
    var userCode=client.getSession("userCode");


    SQL= "select userCode,level,userType,nickName,face,sex,userExplain,exp,(level*level*1000) needExp," +
        "(select name from dataRank where dataRank.ID=userInfo.UserType) rankName," +
        "(select Img from DataRank where DataRank.ID=UserInfo.UserType) rankImg,userMoney from UserInfo where userCode="+userCode;
    mySQL.query(SQL,function(err,row)
    {
        if (err)
            return client.send("err");
        client.dataUser=row;
        client.signed=true;
        client.render("main/myInfo")
    })
}