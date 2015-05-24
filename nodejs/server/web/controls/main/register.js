
var mysql=require("lib/mysql")
var func=require("lib/func")
var async=require("async")


function getRandomCode(StartCode,EndCode,cb)
{
    var Code=StartCode+parseInt(Math.random()*EndCode)

    mysql.query("select UserCode from UserInfo where UserCode="+Code,function(err,row) {
        if (row)
            getRandomCode(StartCode,EndCode,cb)
        else
        {
            cb(Code);
        }
    });
}
function register (RegType,IP,NickName,Sex,Face,PassWD,CallBack) {

    var StartCode, EndCode, UserCode;
    //清除已过期注册信息
    SQL = "delete from UserReg where " + func.time() + "-RegTime>30";
    mysql.exec(SQL)
    async.waterfall([
        //判断注册间隔时间
        function (cb) {

            SQL = "select  ip from UserReg where ip='" + IP + "'";
            mysql.query(SQL, function (err, row) {
                if (row)
                    cb(-2);
               else
                    cb()
            });
        },
        //提取注册号码范围
        function (cb) {
            mysql.query("select StartCode,EndCode from SysSetup", function (err, row) {

                StartCode = row.StartCode
                EndCode = row.EndCode
                cb()

            })
        },
        //检测是否有重复的用户号码
        function (cb) {

            getRandomCode(StartCode, EndCode, function (Code) {
                UserCode = Code
                cb()
            });
        },

        //注册用户
        function (cb) {
            if (RegType == 2)
            {
                PassWD = func.MD5(UserCode.toString(), true);

                var QQFace="public/uploads/"+UserCode+"/"+new Date().getTime()+".jpg";
                func.download(Face,global.webPath+"\\"+QQFace);
                Face=QQFace;
            }
            //注册用户
            SQL = "INSERT INTO UserInfo set UserCode=" + UserCode + ",NickName='" + NickName + "',Face='" + Face + "',PassWD='" + PassWD + "',Sex=" + Sex +
                ",UserExplain='',RegKind=" + RegType + ",IP='" + IP + "',RegDate='" + func.now() + "'";
            mysql.exec(SQL, function (err, result) {
                if (err)
                    cb(-1)
                else
                {

                    mysql.exec("INSERT INTO UserReg SET ip='" + IP + "',regtime=" + func.time());
                    cb(0,UserCode)
                }

            })
        }], function (err, values) {
        if (err)
            CallBack(err);
        else
            CallBack(values);
    });
}
exports.index=function (client,type,NickName,Sex,Face,PassWD) {

    register(type,client.IP(), NickName, Sex, Face, PassWD,function(UserCode){
         if (UserCode > 0)
         {
         if (type==1)
             client.send(UserCode,'注册成功,<br>你的号码是 '+UserCode+ '，请牢记。')
         if (type==2)
            client.send(UserCode,'注册成功,你的号码是 '+UserCode+ '，请牢记。<br>由于您使用了QQ帐号登陆,<br>初始密码为用户号码,<br>请尽快修改。')
         }

        else if (UserCode == -2)
             return client.error('不允许短时间内连续注册。');
         else if (UserCode == -1)
             return client.error('注册失败,处理出错。');
     });

}