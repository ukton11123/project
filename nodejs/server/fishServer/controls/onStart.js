/**
 * Created by Administrator on 2014/10/16 0016.
 * 当web服务启动时执行
 */
var MySQL = require("lib/MySQL");
var func=require("lib/func")
var game=require("./webSocket/game")
exports.start=function()
{
    //加载数据
    loadData();
    setInterval(loadData,10000);
    setInterval(checkData,1000);
    console.log("数据表缓存完毕。")

}

function checkData()
{
    for (var i in global.tables)
    {
        var table=global.tables[i];

        if(table.fishs.length==0)
            table.createFishs();
        else if(table.fishs.length<global.setup.maxFish)
            table.createFish(1);

        table.checkFish();
        if(func.time()-table.time>=global.setup.changeTime)
            table.changeWater();
    }
}
function loadData()
{
    //缓存数据
    MySQL.cacheTable("setup",true);
    MySQL.cacheTable("fish");
    MySQL.cacheTable("fishs");

}