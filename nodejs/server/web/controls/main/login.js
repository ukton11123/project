
var mysql=require("lib/mysql")
var func=require("lib/func")
var encoding = require('encoding');
exports.get=function (client,userCode,passWD) {
    call(userCode,passWD,client.IP(),function(err,row){
        if (err)
         return client.error(err);
        client.send(row)
    })
}
exports.call=call;
function call (userCode,passWD,IP,cb) {

    var  ErrMsg="登录失败,用户号码或密码错误。"
    if (!userCode || !passWD)
        return cb(ErrMsg);
    SQL= "select userCode,nickName,face,userType,userMoney,signInfo,regDate,passWD,level from UserInfo where userCode="+userCode;
    mysql.query(SQL,function(err,row)
    {
        if (!row)//如果没有登陆号码,从老系统中创建
        {
            var conn=mysql.conn("localhost", "root", "ukton80123", "unicooldb");
            var SQL="select passWD,PayPassWD,NickName,UserMoney,BankMoney,UserType,UserExplain,Sex,Age  from UserInfo,UserDetail" +
                " where UserInfo.userCode=UserDetail.userCode and UserInfo.userCode="+userCode+" and passWD='"+passWD+"'";
            conn.query(SQL,function(err,row)
            {

                if (err)
                    return cb(ErrMsg);
                row=row[0]
                var NickName=encoding.convert(row.NickName,"utf-8","gb2312");
                var UserExplain=encoding.convert(row.UserExplain,"utf-8","gb2312");

                SQL= "insert into  UserInfo  set userCode="+userCode+",passWD='"+passWD+"',PaypassWD='"+row.PayPassWD+"',NickName='"+NickName+"'" +
                    ",UserMoney="+row.UserMoney+",BankMoney="+row.BankMoney+",UserType="+row.UserType+",Face='public/img/Face/1-1.jpg'," +
                    "UserExplain='"+UserExplain+"',Sex="+row.Sex+",Age="+row.Age;
                mysql.exec(SQL, function (err, result) {
                    if (err)
                        return cb(ErrMsg);
                    SQL= "select userCode,NickName,Face,UserType,Level,UserMoney,SignInfo,RegDate,passWD from UserInfo where userCode="+userCode;

                    mysql.query(SQL,function(err,row){
                        if (err)
                            return cb(ErrMsg);
                        mysql.exec("update userinfo set logintime='"+func.now()+"',ip='"+IP+"'")

                        return cb(err,false,row);
                    })
                })

            })

        }
        else
        {

            if (row.passWD!=passWD)
                return cb(ErrMsg);

            mysql.exec("update userinfo set logintime='"+func.now()+"',ip='"+IP+"'")

            var RegDate = new Date(row.regDate);
            var ToDay=new Date().getTime()-RegDate.getTime();
            var SingArr = row.signInfo.split(',');
            var Day = new Date().getDate()
            if ((SingArr.indexOf(Day.toString()) != -1) || (ToDay<24*60*60*1000))
                var showSign=false;
            else
                var showSign=true;
            return cb(err,showSign);
        }
    })


}

exports.index=function (client,userCode,passWD) {
    client.sysSetup=global.sysSetup
    //验证登录信息
    call(userCode,passWD,client.IP(),function(err,showSign)
    {
        if (err)
            return client.send("err");
        client.end(showSign);
    })
}