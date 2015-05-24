var login=require("./main/login")
var news=require("./main/news")
var userCount=require("./main/userCount")
exports.index=function (client,loginType) {

    var userCode=client.getSession("userCode");
    var passWD=client.getSession("passWD");
    client.userCode=userCode;
    client.sysSetup=global.sysSetup
    client.dataRoomType=global.dataRoomType
    client.dataApps=global.dataApps
    client.topData=global.topData
    client.loginType=loginType
    //获取在线人数
    userCount.call(client,function(err){

        //获取新闻
        news.call(function(err,rows){
            client.dataNews=  rows;

            //验证cookie 登录信息
            if (!userCode)
                return client.render("index");
            //获取用户信息
            login.call(userCode,passWD,client.IP(),function(err,showSign)
            {
                client.logined=!err;
                client.showSign=showSign;
                client.render("index");
            })
        })
    })
}

