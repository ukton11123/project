//战斗结果静态类
function Result(){};
Result.layer=null;
Result.data=null;
Result.win=false;
Result.create=function(win,data){
	//加载UI
	Result.layer=cu.loadScene(sceneRes.result)
	
	Result.data=data;
	Result.win=win;
	
}
Result.show=function()
{
	cc.log(333)
	cu.currScene().addChild(Result.layer.node);
	cc.audioEngine.playMusic(Result.win?soundRes.win:soundRes.lost);

	cu.get( "Image_Win",Result.layer).setVisible(Result.win)
	cu.get( "Image_Over",Result.layer).setVisible(!Result.win)
	
	//返回
	cu.get( "Button_1",Result.layer).addClickEventListener(
			function()
			{
				Part.create();
				cc.audioEngine.playMusic(soundRes.opening,true)
			});
	//重玩
	cu.get("Button_2",Result.layer).addClickEventListener(
			function()
			{
				Fight.create(Fight.round)
			});	

	cu.get( "Text_level",Result.layer).setString("LV."+Player.data.level);	
	var LoadingBar_exp=cu.get( "LoadingBar_exp",Result.layer);
	LoadingBar_exp.setValue(Player.data.exp,Player.getMaxExp());
	cu.get( "Text_name",Result.layer).setString(Fight.round.name);
	if (!Result.data)
	return;
	cu.playAnime(Result.layer,false,false, 0, 40+Result.data.star*10)	
	
	cu.get( "Text_money",Result.layer).setString(Result.data.money);
	cu.get( "Text_exp",Result.layer).setString(Result.data.exp);
	//显示经验增长动画
	var expPanel=cu.get( "Panel_exp",Result.layer);
	

	LoadingBar_exp.setValue(Player.data.exp+Result.data.exp,Player.getMaxExp(),true,function(){
		//播放升级动画
		Main.playEffect("levelUp");
		cc.audioEngine.playEffect(soundRes.levelUp)
		Player.data.level++;
		cu.get( "Text_level",Result.layer).setString(Player.data.level);
		LoadingBar_exp.setMaxValue(Player.getMaxExp());
	});



	var panel=cu.get( "Panel_2",Result.layer);
	//显示掉落物品
	for (var i in Result.data.items)
	{
		var item=Data.getData("item",Result.data.items[i]);
		var itemIcon=ItemIcon.create(item)
		var col=parseInt(panel.width/itemIcon.width)
		itemIcon.x=itemIcon.width/2+(i%col)*itemIcon.width;
		itemIcon.y=panel.height-itemIcon.height/2-parseInt(i/col)*itemIcon.height;
		panel.addChild(itemIcon);
	}

}
