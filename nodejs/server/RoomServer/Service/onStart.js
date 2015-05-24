var MySQL=require("lib/MySQL")
var Timer = require("./Timer");

exports.start=function() {

    setInterval(LoadData,10000)
    Timer.start();
}
function LoadData()
{
    //缓存数据
    MySQL.cacheTable("sysSetup",true);
    MySQL.cacheTable("dataGift");
    MySQL.cacheTable("dataRank");
    MySQL.cacheTable("dataStamp");
}

LoadData();