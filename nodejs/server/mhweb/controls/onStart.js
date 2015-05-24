/**
 * Created by Administrator on 2014/10/16 0016.
 * 当web服务启动时执行
 */
var MySQL = require("lib/MySQL");
var func=require("lib/func")
exports.start=function()
{


    //加载数据
    loadData();
    setInterval(loadData,10000);
    setInterval(checkData,10000);
    console.log("数据表缓存完毕。")

}
function checkData()
{

}
function loadData()
{
    //缓存数据
    MySQL.cacheTable("sysSetup",true);
    MySQL.cacheTable("baseSkill");
    MySQL.cacheTable("baseMonster");
    MySQL.cacheTable("basePart");
    MySQL.cacheTable("baseDialog");
    MySQL.cacheTable("baseRole");
    MySQL.cacheTable("baseProps");
    //json化关联的物品
    MySQL.cacheTable("baseItem",false,function() {
        for (var i in global.baseItem) {
            if (global.baseItem[i].items)
            global.baseItem[i].items =JSON.parse(global.baseItem[i].items);
        }
    });
    MySQL.cacheTable("baseRound",false,function() {
            for (var i in global.baseRound) {
                if (global.baseRound[i].items)
                global.baseRound[i].items = JSON.parse(global.baseRound[i].items)
            }
    });

    MySQL.cacheTable("baseTask",false,function() {
        for (var i in global.baseTask) {
            if (global.baseTask[i].items)
            global.baseTask[i].items = JSON.parse(global.baseTask[i].items)
        }
    });
    MySQL.cacheTable("baseActiv",false,function() {
        for (var i in global.baseActiv) {
            if (global.baseActiv[i].items)
            global.baseActiv[i].items = JSON.parse(global.baseActiv[i].items)
        }
    });

}