
var MySQL=require("lib/MySQL")
exports.call=call;
function call(searchType,page,searchText,cb) {
    var PageSize=20;
    var QueryText="";
    var currType="";
    //搜索房间
    if (searchType <= 10)
    {

        if (searchType == 1)        //大类搜索
            QueryText = "and roomtype1="+searchText;
        if (searchType == 2)        //小类搜索
            QueryText = "and roomtype2="+searchText;

        if (searchType<3)
            for(var i in global.dataRoomType)
                if (global.dataRoomType[i].ID==searchText)
                    currType=global.dataRoomType[i].Name;

        if (searchType == 3)        //条件搜索
        {
            QueryText = "and RoomName like '%"+searchText+"%'";
            if (!isNaN(parseInt(searchText,10)))
             QueryText += " or RoomCode="+searchText;
            currType="符合"+searchText+"的";

        }
        if (searchType<3)
            for(var i in global.dataRoomType)
            if (global.dataRoomType[i].ID==searchText)
                currType=global.dataRoomType[i].Name;

        if (searchType == 4)        //热门主播
        {
            QueryText = "and roomtype=1";
            currType="热门主播"
        }
        if (searchType == 5)        //热门房间
        {
            QueryText = "and roomtype<>1";
            currType="热门房间"
        }
        var  index = PageSize * page;
        SQL = "select RoomCode,LogoURL,RoomName,RoomType,RoomerCode,(select count(UserCode) from RoomUser where RoomUser.RoomCode=RoomInfo.RoomCode) " +
            "MemberCount,RoomState from RoomInfo  where RoomState<>0 "+QueryText+"  order by MemberCount  desc  limit "+index+","+PageSize;

        MySQL.list(SQL,function(err,rows) {
            if (err)
                return cb("操作失败。");
            for (var i in rows)
            if(!rows[i].LogoURL)
                rows[i].LogoURL="/public/img/ChatRoom"+parseInt(Math.random()*3+1)+".jpg"
            cb(err,currType,rows)
        });
    }
    //创建 收藏的房间
    if (searchType >= 10)
    {
        if (searchType == 11)
        {
            QueryText = " UserRoom.UserCode="+searchText+"  and UserRoom.RoomGroup in (1,2,3,5)";
            currType="我收藏的房间"
        }
        if (searchType == 12)
        {
            QueryText = "RoomInfo.RoomerCode="+searchText;
            currType="我创建的房间"
        }
        if (searchType == 13)
        {
            QueryText ="( UserRoom.UserCode="+searchText+"  and UserRoom.RoomGroup in (1,2,3,5)) or (RoomInfo.RoomerCode="+searchText+")";
            currType="我的房间"
        }


        SQL = "select RoomInfo.RoomCode,RoomInfo.LogoURL,RoomInfo.RoomName,RoomInfo.RoomType,RoomInfo.RoomerCode," +
            "(select count(UserCode) from RoomUser where  RoomInfo.RoomState<>0 and RoomUser.RoomCode=RoomInfo.RoomCode) MemberCount,RoomInfo.RoomState from RoomInfo,UserRoom " +
            " where UserRoom.RoomCode=RoomInfo.RoomCode  and "+QueryText;


        MySQL.list(SQL, function(err,rows)
        {

            if (err)
                return cb("操作失败。");
            for (var i in rows)
                if(!rows[i].LogoURL)
                    rows[i].LogoURL="/public/img/ChatRoom"+parseInt(Math.random()*3+1)+".jpg"
            cb(err,currType,rows)
        });

    }

}

exports.index=function (client,searchType,page,SearchText) {

    if(!page)
        page=0;
    if(!SearchText)
        SearchText="";
    call(searchType,page,SearchText,function(err,currType,rows){
        if (err)
            return client.error("操作失败。");
        client.dataRoomList=rows;
        client.currType=currType;
        client.page=page;
        client.render("main/roomList")
    })
}
