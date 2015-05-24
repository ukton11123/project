var mysql=require("lib/mysql")
var func=require("lib/func")
var async=require("async")
function init(client)
{
    client.myCode=client.getSession("userCode");
    client.myCode=client.myCode?client.myCode:0
    client.sysSetup=global.sysSetup;

}
exports.index=function(client)
{

    init(client);

    //如果没有登录,显示广场
    if (!client.myCode)
        publicChat(client)
    else//否则显示用户发言
        userChat(client,client.myCode)
}

//赞
exports.acclaim=function(client,ID)
{
    init(client);
    var SQL="select * from zoneAcclaim where ChatID="+ID+" and userCode="+client.myCode;
    mysql.query(SQL,function(err,row) {
        if (row)
            return client.end("-1")
        mysql.insert("zoneAcclaim",{UserCode:client.myCode,ChatID:ID},function(err){
            mysql.query("select Count(*) rowCount from zoneAcclaim where ChatID="+ID,function(err,row){

                return client.end(row.rowCount.toString());
            })
        })
    })
}
exports.publicChat=publicChat;
function publicChat(client)
{
    init(client);
    client.view="publicChat";
    getShowUser(client,client.userCode,function(err){
        getUserChat(client,0,function(err){
            client.render("zone")
        })
    })

}
exports.userChat=userChat;
function userChat(client,userCode,page,cb)
{

    init(client);
    if (!page)
        page=0;
    client.page=page;
    client.view="userChat";
    client.chatType=userCode==client.myCode?1:2;
  
    getShowUser(client,userCode,function(err){

        getUserChat(client,userCode,function(err){
            if (cb)
            return cb(err)
            client.render("zone")
        })
    })
}

exports.moreChat=function(client,view,userCode,chatType,page)
{
    init(client);
    client.page=page?page:0;
    client.view=view;
    client.chatType=chatType;
    //获取关注名单
    if (view=="userCared")
    {
        getCaredUser(client,chatType,userCode,function(err) {
            getUserChat(client, userCode, function (err) {
                client.render("zone/chatList")
            })
        })
    }
    else
        getUserChat(client, userCode, function (err) {
            client.render("zone/chatList")
        })

}
exports.userMsg=function(client,type)
{

    init(client);

    client.view="userMsg";
    client.chatType=type;
    getShowUser(client,client.myCode,function(err){

        getUserChat(client,client.myCode,function(err){
            client.render("zone")
        })
    })

}
exports.userCared=function (client,type,userCode)
{

    init(client);
    client.caredType=type
    client.view="userCared";
    getShowUser(client,userCode,function(err){
        //获取关注名单
        getCaredUser(client,type,userCode,function(err){

            //获取关注发言
            getUserChat(client,client.myCode,function(err){
                client.render("zone")
            })
        })
    })

}
exports.delete=function (client,id)
{

    init(client);
    mysql.exec("delete from zonechat where userCode="+client.myCode+" and  ID="+id,function(err){
        if (err)
            return client.end("删除失败")
        mysql.exec("delete from ZoneAcclaim where ChatID="+id);
        mysql.exec("delete from zonechat where Type=3 and TargetID="+id);
        client.end("删除成功")
    })

}

exports.care=function (client,userCode)
{
    init(client);
    if (!client.myCode)
        return client.end();
    mysql.query("select UserCode from ZoneCare where UserCode="+client.myCode+" and TargetCode="+userCode,function(err,row){
        if (row) {
            mysql.exec("delete from ZoneCare where UserCode=" + client.myCode + " and TargetCode=" + userCode)
            client.end("关注Ta")
        }
        else {
            mysql.exec("insert into ZoneCare set UserCode=" + client.myCode + ",TargetCode=" + userCode)
            client.end("取消关注")
        }
    })

}
exports.create=function (client)
{

    init(client);
    if (!client.myCode)
        return client.end()
    var SQL="insert into zoneChat set Text='"+client.post.Text+"',time="+func.time()+",type="+client.post.chatType+",userCode="+client.myCode;
    if (client.post.chatType>1)
        SQL+=",targetID="+client.post.targetID;


    mysql.exec(SQL,function(err,result){
        if (err)
            return client.end()
        client.end(result.insertId)
    })

}
exports.getChatItem=function(client,ID)
{
    init(client);
    var SQL="select ZoneChat.ID,UserInfo.UserCode,NickName,Face,Text,Time,RoomCode," +
        "(select count(ZoneAcclaim.ID) from ZoneAcclaim where ZoneAcclaim.ChatID=ZoneChat.ID) AcclaimCount"+
        " from ZoneChat,UserInfo where UserInfo.UserCode=ZoneChat.UserCode and  ID="+ID;
    mysql.query(SQL,function(err,row){
        if (err)
            return client.end()
        row.Time = func.agoTime(row.Time)
        row.myCode=client.myCode

        //获取评论

        var SQL="select ZoneChat.ID,UserInfo.UserCode,NickName,Face,Text,Time"+
            " from ZoneChat,UserInfo where UserInfo.UserCode=ZoneChat.UserCode and  Type=3 and  " +
            "ZoneChat.targetID="+ID+" order by id asc";
        mysql.list(SQL,function(err,rows) {
            for (var i in rows)
                rows[i].Time = func.agoTime(rows[i].Time)
            row.apply=rows;
            client.render("zone/chatItem",row)
        })

    })
}
exports.getEmote=function(client,chatType)
{
    init(client);
    client.dataEmote=global.dataEmote
    client.chatType=chatType
    client.render("zone/emote")
}
exports.getSkin=function(client)
{
    client.render("zone/skin")
}
exports.selectSkin=function(client,ID)
{
    init(client);
    if (!client.myCode)
        return;
    mysql.exec("update  userinfo set ZoneSkin="+ID+" where userCode="+client.myCode,function(err){
        if (err)
            return client.end("操作失败")

        client.end("操作成功")
    })
}

exports.getInput=function(client,chatType,targetID)
{
    init(client);

    client.chatType=chatType
    client.targetID=targetID
    client.render("zone/input")

}
//获取显示用户信息
function getShowUser(client,userCode,cb)
{

    if (!userCode)
        return cb()
    var SQL="select UserCode,NickName,Face,UserExplain,DataRank.Name,DataRank.Img,Level,ZoneSkin from userinfo,DataRank where " +
        "DataRank.ID=userInfo.userType and usercode="+userCode;
    mysql.query(SQL,function(err,row)
    {
        if(err)
        return  cb(err)
        client.showUser=row;

        //是否被我收听
        mysql.query("select Count(UserCode) Count from ZoneCare where UserCode="+client.myCode+" and TargetCode="+userCode,function(err,row){
            client.showUser.cared=row;
            //听众数量
            mysql.query("select Count(UserCode) Count from ZoneCare where TargetCode="+userCode,function(err,row){
                client.showUser.caredCount=row.Count;
                //收听数量
                mysql.query("select Count(UserCode) Count from ZoneCare where UserCode="+userCode,function(err,row){
                    client.showUser.beCaredCount=row.Count;
                    //广播数量
                    mysql.query("select Count(UserCode) Count from ZoneChat where Type=1 and UserCode="+userCode,function(err,row){
                        client.showUser.chatCount=row.Count;
                        //消息数量
                        mysql.query("select Count(UserCode) Count from ZoneChat where Readed=0 and Type=2 and TargetID="+userCode,function(err,row){
                            client.showUser.msgCount=row.Count;
                            cb()
                        })
                    })
                })
            })
        })

    })
}
//获取用户发言
function getUserChat(client,userCode,cb)
{
    var text='';
    if (client.view=="publicChat")
        text="  Type=1 ";
    if (client.view=="userChat")
        text="  Type=1 and  UserInfo.UserCode="+userCode;
    if (client.view=="userMsg")
    {
        if (client.chatType==3)
            text="  Type=2 and  ZoneChat.TargetID="+userCode;
        if (client.chatType==4)
            text="  Type=2 and  ZoneChat.UserCode="+userCode;
    }
    if (client.view=="userCared") {
        var Codes = "";
        for (var i in client.rowsCared)
        {
            Codes += Codes ? "," : "";
            Codes += client.rowsCared[i].UserCode;
        }
        text="  Type=1 and  ZoneChat.UserCode in ("+Codes+")";
    }
    client.page=client.page?client.page:0;
    var SQL="select ZoneChat.ID,UserInfo.UserCode,NickName,Face,Text,Time,RoomCode," +
        "(select count(ZoneAcclaim.ID) from ZoneAcclaim where ZoneAcclaim.ChatID=ZoneChat.ID) AcclaimCount"+
        " from ZoneChat,UserInfo where UserInfo.UserCode=ZoneChat.UserCode and " +
        text+" order by id desc limit "+client.page*10+",10";
    mysql.list(SQL,function(err,rows){
        for (var i in rows) {
            rows[i].Time = func.agoTime(rows[i].Time)
            rows[i].myCode = client.myCode
        }
        client.rowsChat=rows;
        //获取评论
        async.each(rows,function(row,callback){
            var SQL="select ZoneChat.ID,UserInfo.UserCode,NickName,Face,Text,Time"+
                " from ZoneChat,UserInfo where UserInfo.UserCode=ZoneChat.UserCode and  Type=3 and  " +
                "ZoneChat.targetID="+row.ID+" order by id asc";
            mysql.list(SQL,function(err,rows) {
                for (var i in rows)
                    rows[i].Time = func.agoTime(rows[i].Time)

                for(var i in client.rowsChat)
                    if (client.rowsChat[i].ID==row.ID)
                        client.rowsChat[i].apply=rows;

                callback()
            });
        },function(err){
            cb(err);
        })

    })

}
//获取关注用户
function getCaredUser(client,type,userCode,cb)
{
    if (type==1)
        var Text="UserInfo.UserCode = ZoneCare.TargetCode and  ZoneCare.UserCode="+userCode;
    else
        var Text="UserInfo.UserCode = ZoneCare.UserCode and ZoneCare.TargetCode="+userCode;

    mysql.list("select UserInfo.UserCode,NickName,Face from ZoneCare,UserInfo where  "+Text,function(err,rows) {
        client.rowsCared = rows
        cb(err)
    });
}

