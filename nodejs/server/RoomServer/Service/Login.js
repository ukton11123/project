var Socket=require("lib/Socket")
var MySQL=require("lib/MySQL")
var async=require("async");
var Common=require("Lib/Common")
var func=require("Lib/Func")
var data=require("./data");
exports.OnData=function (client,RoomCode,UserCode,PassWD)
{
    const  Msg_Error = "进入聊天室失败，数据处理出错。";
    const  Msg_Full = "聊天室人满,升级到VIP会员可进入。";
    const  Msg_Close = "聊天室被关闭，无法进入。";
    const  Msg_Black = "您已经被此聊天室列入黑名单，无法进入。"
    function OnError(ErrMsg) {
        if (!ErrMsg)
            ErrMsg = Msg_Error;
        client.send( "Error", ErrMsg);
    }
    var User={};
    var Room;

    async.waterfall([
    //清除已登录的用户数据
    function (cb)
    {
        if (UserCode==0)
        cb()
        else
        Common.userQuit(UserCode,function (err){cb()});
    },
    //获取用户数据
    function (cb)
    {
        if (UserCode==0)
        {
            UserCode=parseInt(Math.random()*10000000+10000000);
            User.UserCode=UserCode;

            User.NickName="游客"+User.UserCode;
            User.UserType=20;
            User.Face = "public/img/face/1-1.jpg";
            User.Level = 0;
            User.RoomType = 0;
            User.UserMoney =0;

            cb();
        }
        else
        {
        var PropsSQL="select PropsID from UserProps where UserCode="+UserCode+" and Kind=2 limit 1";
        var stampSQL="select StampID from UserStamp where UserCode="+UserCode+"  limit 1";

        MySQL.query("select UserCode,NickName,UserType,Face,Level,DomainCode,UserMoney,1 CanChat,1 CanAudio,1 CanVideo,0 RoomType,("+PropsSQL+") PropsID," +
                "("+stampSQL+") StampID from UserInfo where UserCode=" + UserCode+" and PassWD='"+PassWD+"'",
            function (err, Row){
                if (Row)
                    User= Row;
                cb(err);
            });
        }
    },
        //发送房间用户
        function (cb) {
            //绑定号码到Socket
            client.setName(UserCode);

            client.send("Login", UserCode,User.UserMoney);
            MySQL.list("select * from RoomUser where RoomCode=" + RoomCode, function (err, Rows){
                client.send( "UserList", Rows);
                cb(err);
            });
        },
    //获取聊天室信息
    function (cb) {
        var ManagerSQL="select RoomGroup from UserRoom where UserCode="+UserCode+" and RoomCode="+RoomCode+" and RoomGroup in (3,5)  limit 1";
        var BlackSQL="select RoomGroup from UserRoom where UserCode="+UserCode+" and RoomCode="+RoomCode+" and RoomGroup =4  limit 1";

        MySQL.query("select RoomerCode,RoomState,RoomType1,RoomType2,("+ManagerSQL+") RoomGroup,("+BlackSQL+") BlackList from RoomInfo where RoomCode=" + RoomCode,
            function (err, Row){
                if (Row)
                    Room= Row;
                cb(err);
            });
    },

    //新建聊天室用户
    function (cb) {
        //判断是否黑名单
        if (Room.BlackList)
        {
            OnError(Msg_Black)
            return;
        }

        User.RoomType=0;
        if (Room.RoomGroup==3 )
            User.RoomType=2
        if (Room.RoomGroup==5 )
            User.RoomType=3
        if (Room.RoomerCode==UserCode )
            User.RoomType=4
        //判断是否区管
        if (User.DomainCode && data.Rank(User.UserType).DomainManager)
            if (User.DomainCode != Room.RoomType2 && User.DomainCode != Room.RoomType1)
                User.UserType = 0;

        if (!User.PropsID)
            User.PropsID=0
        if (!User.StampID)
            User.StampID=0

        //判断房间是否人满
      //  if (Data.Rank(User.UserType).EnterFullRoom==0 && Room.MemberCount >= Room.MaxUser && User.RoomType==0)
        {
      //      OnError(Msg_Full)
      //      return;
        }

        //判断房间是否关闭

        if (data.Rank(User.UserType).EnterCloseRoom == 0 && Room.RoomState ==2 && User.RoomType==0)
        {
            OnError(Msg_Close)
            return;
        }

        //新建聊天室用户
        var SQL="insert into RoomUser set RoomCode="+RoomCode+",UserCode="+User.UserCode+",NickName='"+User.NickName+"',UserType="+User.UserType+",Face='"+User.Face+"'," +
            "Level="+User.Level+",RoomType="+User.RoomType+",PropsID="+User.PropsID+",StampID="+User.StampID+",ActiveTime="+func.time();

        MySQL.exec(SQL,function (err, result){cb(err);});


    },


    //发送新用户进入
    function (cb) {
        Common.saveServerMsg(RoomCode,0, "UserEnter", User);
        cb()
    },
    function (cb) {
        //返回麦序
        MySQL.list("select UserCode from RoomOrder where RoomCode=" + RoomCode,
            function (err, Rows){
                client.send("OrderList", Rows);
                cb(err);
            });
    },
    function (cb) {
        //返回贵重礼物
        Common.sendRichGift(client)
        cb();
    }], function (err, values) {
    if (err)
        OnError();
});


}
