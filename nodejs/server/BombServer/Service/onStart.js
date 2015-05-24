var mysql=require("lib/mysql")
var timer = require("./timer");

exports.start=function() {

    setInterval(loadData,60*1000)
    timer.start();
}
function loadData()
{
    //缓存数据

}

loadData();