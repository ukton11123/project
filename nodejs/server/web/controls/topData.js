/**
 * Created by Administrator on 2014/10/17 0017.
 * 创建排行榜数据模块
 */
var mysql=require("Lib/MySQL")
var async=require("async")
exports.CreateData=function()
{
    var QueryTime=60*30;

    //更新排行数据,保存为xml格式
    var Count=0;
    var topData=new Array();
    async.waterfall([
        function (cb) {
            var data = {};
            data.name = "本周房间排名";
            data.img = "/public/Img/RoomManage.png"
            data.type = 2
            //房间排行
            var SQL = "select Sum(UserMoney.ReciveMoney) money,RoomInfo.RoomCode code ,RoomInfo.RoomName name ,RoomInfo.LogoURL img from Usermoney,RoomInfo";
            SQL += " where UserMoney.RecordType=1 and  RoomInfo.RoomCode=UserMoney.RoomCode";
            SQL += " and YEARWEEK(date_format(dealtime,'%Y-%m-%d')) = YEARWEEK(DATE_SUB(now(),INTERVAL 1 DAY)) ";
            SQL += "group by RoomInfo.RoomCode order by Sum(UserMoney.ReciveMoney) desc limit 10";
            mysql.list(SQL, function (err, rows) {

                for (var i in rows)
                {
                    if (i==0)
                        if (!rows[i].img)
                            rows[i].img="/public/Img/ChatRoom.png";

                    rows[i].money=parseInt(rows[i].money/10000)
                }
                data.items = rows;

                topData.push(data);
                cb(err)

            })
        },
        //人气排行
        function (cb) {
            var data = {};
            data.name = "本周人气排名";
            data.img = "/public/Img/Collect.png"
            data.type = 1
            var SQL = "select Sum(UserMoney.ReciveMoney) money,UserInfo.UserCode code ,UserInfo.NickName name ,UserInfo.Face img from Usermoney,UserInfo";
            SQL += " where UserMoney.RecordType=1 and  UserInfo.UserCode=UserMoney.targetcode";
            SQL += " and YEARWEEK(date_format(dealtime,'%Y-%m-%d')) = YEARWEEK(DATE_SUB(now(),INTERVAL 1 DAY)) ";
            SQL += "group by UserInfo.UserCode order by Sum(UserMoney.ReciveMoney) desc limit 10";
            mysql.list(SQL, function (err, rows) {


                for (var i in rows)
                    rows[i].money = parseInt(rows[i].money / 10000)
                data.items = rows;
                topData.push(data);
                cb(err)

            })
        },

        //富豪排行
        function (cb) {
            var data = {};
            data.name = "本周富豪排名";
            data.img = "/public/Img/Money.png"
            data.type = 1
            var SQL = "select -Sum(UserMoney.SendMoney) money,UserInfo.UserCode code ,UserInfo.NickName name ,UserInfo.Face img from Usermoney,UserInfo";
            SQL += " where UserMoney.RecordType=1 and  UserInfo.UserCode=UserMoney.targetcode";
            SQL += " and YEARWEEK(date_format(dealtime,'%Y-%m-%d')) = YEARWEEK(DATE_SUB(now(),INTERVAL 1 DAY)) ";
            SQL += "group by UserInfo.UserCode order by Sum(UserMoney.SendMoney) desc limit 10";
            mysql.list(SQL, function (err, rows) {


                for (var i in rows)
                    rows[i].money = parseInt(rows[i].money / 10000)
                data.items = rows;
                topData.push(data);
                cb(err)

            })
        },
        //礼物排行
        function (cb) {
            for (var i in global.dataGift)

                if (global.dataGift[i].Top!=0)
                {
                    var row=global.dataGift[i];
                    var data = {};
                    data.name = row.Name+"排名";
                    data.img = "/public/Img/Gift/"+row.Img
                    data.type = 1
                    data.giftID = row.ID
                    data.giftPrice = row.Price
                    topData.push(data);
                    var SQL = "select -Sum(UserMoney.SendMoney) money,UserInfo.UserCode code ,UserInfo.NickName name ,UserInfo.Face img,giftID" +
                        " from Usermoney,UserInfo where UserMoney.RecordType=1 and  UserInfo.UserCode=UserMoney.targetcode " +
                        "and giftID=" +row.ID+" and YEARWEEK(date_format(dealtime,'%Y-%m-%d')) = YEARWEEK(DATE_SUB(now(),INTERVAL 1 DAY)) " +
                        "group by UserInfo.UserCode order by Sum(UserMoney.SendMoney) asc limit 10";

                    mysql.list(SQL, function (err, rows) {



                            for (var j in rows) {

                                for (var i in topData)
                                    if (topData[i].giftID == rows[j].giftID) {
                                        rows[j].money = parseInt(rows[j].money / topData[i].giftPrice)

                                        topData[i].items = rows;
                                    }
                            }

                    })
                }
            cb();
        }], function (err, values) {
        if (err)
            console.log("礼物排行创建失败");

        global.topData=topData;
        global.topDataTime=new Date().getTime();

    })
}