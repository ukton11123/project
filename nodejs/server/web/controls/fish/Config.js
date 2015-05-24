_Config=
{
    MoneyName:"酷币",
    rate:100,       //金币->游戏币兑换率
    fishAmount:15,//鱼数量
    fishCount:12,//鱼种类数量
    fishPrice:[1,2,3,5,10,20,30,50,100,120,150,200],//金额
    hard:2//难度
};
exports.get=function()
{
    return _Config;
}
exports.CreateFish=function()
{
    var FishType=parseInt(Math.random()*_Config.fishCount);
    while (parseInt(Math.random()*_Config.fishCount)!=0)
        FishType=parseInt(Math.random()*_Config.fishCount);

    if (FishType<1)
        FishType=1;
    return FishType;
}