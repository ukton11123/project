//全局数据中心
Data.userName="1";
Data.passWD="";
function Data(){};
Data.homePage="http://127.0.0.1/"//"http://192.168.1.100/"//"http://www.52xingxiu.com:88/";//
Data.maxBagGrid=100;//最大背包格子
Data.itemTypeInfo=[["武器","帽子","衣服","靴子","项链","戒指"],["食物","药水"],["碎片"],["宝箱"],["宝石"],["道具"],["任务"],["其他"]];
Data.itemColorInfo=[cc.color(255,255,255),//白色
                     cc.color(9,235,5),//绿色
                     cc.color(15,83,201),//蓝色
                     cc.color(154,6,165),//紫色
                     cc.color(240,148,59),//橙色
                     cc.color(234,15,39)];//红色
Data.itemColorName=["普通","魔法","稀有","史诗","传奇","神器"];

//获取基础数据
Data.getData=function(name,id)
{
	for (var i in Data[name])
		if (Data[name][i].ID==ID)
			return Data[name][i];
}
Data.setup=null;//系统设置库
Data.doalog={};//对话基础库(http服务端获取)
Data.part={};//章节基础库(http服务端获取)
Data.round={};//关卡基础库(http服务端获取)
Data.item={};//物品基础库(http服务端获取)
Data.monster={};//怪物基础数据
Data.skill={};//技能基础数据
Data.task={};//任务基础数据
Data.getData=function(name,id)
{
	for (var i in Data[name])
		if (Data[name][i].ID==id)
			return Data[name][i];
}



