var login=require("./login")
exports.login=function (client,userCode,passWD) {
    client.sysSetup=global.sysSetup
    //验证登录信息
    login.call(userCode,passWD,client.IP(),function(err,signed,row)
            {
                if (err)
                    return client.send("err");
                client.dataUser=row;
                client.signed=signed;
                client.render("main/myInfo")
            })
}
