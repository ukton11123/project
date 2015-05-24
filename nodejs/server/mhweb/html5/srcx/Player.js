//玩家静态类
function Player(){};
Player.hp=0;
Player.data={};//用户信息
Player.skill1Power=0;
Player.skill2Power=0;
Player.skill3Power=0;
Player.task={};//用户任务列表
Player.round={};//用户关卡信息
Player.items={};//用户物品信息(http服务端获取)

Player.getRound=function(roundID)
{
	for (var i in Player.round)
		if (Player.round[i].roundID==roundID)
			return Player.round[i];

} 
Player.getItem=function(id){
	for (var i in Player.items)
		if (Player.items[i].ID==id)
			return Player.items[i];
	return null;
}
//玩家被攻击
Player.beAttack=function(sender){

	if (this.hp==0)
		return;

	if(sender.kind==2)//如果被技能击中,移除技能
		MonsterSkill.die(sender);
	var eff=sender.kind==2?"#res/eff_break.png":"#res/eff_break"+(parseInt(Math.random()*2+1))+".png"

			var effBreak=new cc.Sprite(eff);
	cu.currScene().addChild(effBreak)
	cu.center(effBreak);  
	cu.free(effBreak,1)

	if (sender.kind==1)//被怪物击中
	{
		effBreak.setRotation(Math.random()*360)
		cc.audioEngine.playEffect(soundRes.hit);
	}
	else//被技能击中
	{
		cu.setSize(effBreak,cc.winSize.width,cc.winSize.height);
		cc.audioEngine.playEffect(soundRes.break3);
	}
	if (Player.hp==0)
		return;
	//扣除玩家hp
	var attData=Main.getAttackData(sender.data,Player.getData());

	if (!attData.miss)
		Player.hp-=attData.hp;
	if (Player.hp<0)
		Player.hp=0;

	cu.get("LoadingBar_HP").setPercent(parseInt(Player.hp/Player.data.hp*100));

	cu.get("Text_HP").setString(Player.hp+"/"+Player.data.hp);

	Main.flyHP(null,attData)

	//摇晃屏幕
	if(sender.kind==2)
		Fight.rock();
	//玩家死亡
	if (Player.hp==0)
	{
		Fight.showResult(false)
	}

}

Player.skill=function(type)
{

	if (Player["skill"+type+"Power"]<100)
		return;
	Player["skill"+type+"Power"]=0;
	Main.playEffect("playerSkill"+type)

	cc.audioEngine.playEffect("res/sound/playerSkill"+type+".mp3")
	var skillImg=cu.get("Image_skill");
	skillImg.x=680;
	skillImg.setOpacity(255)
	var action=cc.moveTo(0.2,0,skillImg.y)
	var delay=cc.delayTime(1)
	var fade=cc.fadeOut(0.5)
	skillImg.runAction(cc.sequence(action,delay,fade))
	//技能伤害
	Fight.skillAttack(100,1,5)
}
Player.getValue=function(name)
{
	var value=Player.data[name];

	for (var i in Player.items)
		if (Player.items[i].equiped)
		{
			var item=Data.getData("item",Player.items[i].itemID);
			value+=item[name];

		}
	return value;
}

Player.getData=function()
{
	var data={};
	data.att=Player.getValue("att");
	data.hp=Player.getValue("hp");
	data.def=Player.getValue("def");
	data.crt=Player.getValue("crt");
	data.aov=Player.getValue("aov");
	data.hit=Player.getValue("hit");
	return data;
}
//获取当前升级需要经验
Player.getMaxExp=function()
{
	return Data.setup.levelUpValue*(Player.data.level*5+Player.data.level*Player.data.level*Player.data.level)-80;
}
//获取装备升级需要经验
Player.getItemMaxExp=function(userItem)
{
	return Data.setup.itemlevelUpValue*(userItem.level*5+userItem.level*userItem.level*userItem.level)-80;
}
//整理物品
Player.shortItem=function()
{
	Player.items.sort(function(a,b){
		var item1=Data.getData("item",a.itemID);
		var item2=Data.getData("item",b.itemID);
		if (item1.itemType>item2.itemType)
			return -1
			else if (item1.itemType<item2.itemType)
				return 1
				else if (item1.quality>item2.quality)
					return -1
					else if (item1.quality<item2.quality)
						return 1
						else if (item1.ID>item2.ID)
							return -1
							else if (item1.ID<item2.ID)
								return 1								
								else if (a.amount>b.amount)
									return -1
									else if (a.amount<b.amount)
										return 1
										else if (a.level>b.level)
											return -1
											else if (a.level<b.level)
												return 1				

												else if (item1.type>item2.type)
													return -1
													else
														return 1


	});//
}