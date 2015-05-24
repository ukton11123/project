//用户信息层静态类
function Info(){};
Info.layer=null;
Info.create=function(){
	//加载UI 
	this.layer=cu.loadScene(sceneRes.info)
	this.show()
	return Info.layer.node;
};
//显示
Info.show=function()
{
	cu.get("Text_nickName",Info.layer).setString(Player.data.nickName)
	cu.get("Text_level",Info.layer).setString("LV."+Player.data.level)
	cu.get("Text_money",Info.layer).setString(Player.data.money)
	cu.get("Text_exp",Info.layer).setString(Player.data.exp+"/"+Player.getMaxExp())
	cu.get("Text_token",Info.layer).setString(Player.data.token)
	cu.get("Text_power",Info.layer).setString(Player.data.power+"/"+Data.setup.maxPower) 

	cu.get("LoadingBar_exp",Info.layer).setPercent(parseInt(Player.data.exp/Player.getMaxExp()*100))
	cu.get("LoadingBar_power",Info.layer).setPercent(parseInt(Player.data.power/Data.setup.maxPower*100))

}
//获取数据
Info.getInfo=function()
{

	cn.send(Data.homePage+"game/user/get",Data.userName,Data.passWD,
				function(data){
			Player.data=data;
			Info.show();
		});	
}