/**
 * Created by Administrator on 2014/10/16 0016.
 * 当web服务启动时执行
 */
var MySQL = require("lib/MySQL");
var topData=require("./topData")
var carsService=require("./cars/index")
var horseService=require("./horse/index")
var redBag=require("./admin/redBag")
var func=require("lib/func")
exports.start=function()
{

    //启动车行服务
    carsService.start();
    //启动赛马服务
    horseService.start();

    //加载数据
    loadData();
    setInterval(loadData,10000);
    setInterval(checkRedBag,1000);//检测定时红包
    setInterval(checkProps,1000);//检测道具到期
    console.log("数据表缓存完毕。")
    //创建排行
    topData.CreateData()

}
function checkProps()
{
    function getProps(id)
    {
        for (var i in global.dataMall)
            if (global.dataMall[i].ID==id)
                return global.dataMall[i]
    }

    MySQL.list("select *  from userProps",function(err,rows){

        var time=func.time();

        for (var i in rows)
        {
            var props=getProps(rows[i].PropsID);
            if (props)
           if (time-rows[i].BuyTime>props.PropsLimit*24*60*60)
           {
               MySQL.exec("delete from userProps where id="+rows[i].ID)
               console.log("清除道具")
               //头衔道具到期,设置头衔为普通
               if (rows[i].Kind==1)
               {
                   MySQL.exec("update userinfo set userType=0 where userCode="+rows[i].UserCode)
                   console.log("还原头衔"+rows[i].UserCode)
               }

           }
        }
    })
}
function checkRedBag()
{
    MySQL.list("select *  from sysRedBag",function(err,rows){

       var date=new Date();
        var time=date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
       for (var i in rows)
        if (rows[i].time==time)
            redBag.sendRedBag(rows[i].money);
    })
}
function loadData()
{

    //缓存数据
    MySQL.cacheTable("sysSetup",true);
    MySQL.cacheTable("dataMall");
    MySQL.cacheTable("dataApps");
    MySQL.cacheTable("dataGift");
    MySQL.cacheTable("dataBao");
    MySQL.cacheTable("dataUnlawText",true);
    MySQL.cacheTable("dataRank");
    MySQL.cacheTable("dataRoomType");
    MySQL.cacheTable("dataFace");
    MySQL.cacheTable("dataEmote");
    MySQL.cacheTable("dataAcclaim");
    MySQL.cacheTable("dataStamp");
    MySQL.cacheTable("dataRoomType");
}