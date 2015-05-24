
//战斗场景静态类
function Fight(){};
Fight.layer=null;
Fight.mapLayer=null;
Fight.useTime=0.0;
Fight._startPos=null;
Fight._lastPos=null;
Fight._hits=0;
Fight._lastAttackTime=0;
Fight._hitText=null;
Fight._handInfo=[];
Fight._touched=false;
Fight._skillAtt=0;
Fight._touchListenser=null;
Fight.state=0;//战斗状态  0  战斗中  1 胜利  2 失败
Fight.round=null;
Fight.scene=null;
Fight.create=function(round){

	Fight.round=round;
	//加载地图
	cu.loadMap("res/map/",round.map,function(mapLayer){ 
		Fight.mapLayer=mapLayer;
		Fight.scene=new cc.Scene();
		Fight.scene.addChild(Fight.mapLayer.node);
		cc.director.runScene(cc.TransitionFade.create(1,Fight.scene))
		//延迟加载 因为场景切换需要1秒时间
		Fight.showMonster()
		//Fight.scene.scheduleOnce(Fight.showMonster, 1)
	})
}
//怪物出场
Fight.showMonster=function()
{
	//获取场景怪物
	for(var i in Fight.mapLayer.node.getChildren())
	{
		var monster=Fight.mapLayer.node.getChildren()[i];
		if (monster.kind==1)
		{
			//创建影子
			var shadow=new cc.Sprite("#res/shadow.png")
			shadow.x=monster.x;
			shadow.y=monster.y-monster.height/2+40;
			monster.shadow=shadow;
			shadow.setScale(monster.width/shadow.width*0.8, monster.width/shadow.width*0.8)
			Fight.scene.addChild(shadow)
			
			var y=monster.y;
			monster.y=cc.winSize.height+monster.height;
			var dealy=cc.delayTime(1)
			var action=cc.moveTo(0.3, cc.p(monster.x,y))
			var finish=cc.callFunc(Fight.showDust, monster)
			monster.runAction(cc.sequence(dealy,action,finish))
		}
	}
	Fight.scene.scheduleOnce(Fight.startDialog,2)

}
//显示灰尘
Fight.showDust=function(monster)
{
	cc.audioEngine.playEffect(soundRes.skill)
	//播放战斗音乐
	cc.audioEngine.playMusic(soundRes.battle,true)
	var dust=new cc.Sprite()
	Fight.scene.addChild(dust)

	cu.addMovie(dust, "res/dust")
	cu.playMovie(dust,function(sender){
		cu.free(dust,0.4)
	})
	dust.x=monster.x;
	dust.y=monster.y-monster.height/2+40;
	dust.setScale(monster.width/170, monster.width/170)
}
//开场对话
Fight.startDialog=function()
{
	for (var i in Data.dialog)
		if (Data.dialog[i].roundID==Fight.round.ID && Data.dialog[i].type==0)
			return Dialog.showDialog(Data.dialog[i].ID,true,Fight.start)
	Fight.start()
	
}
Fight.start=function()
{
	cc.log(222)
	//加载主layer
	Fight.layer=cu.loadScene(sceneRes.fight);
	Fight.scene.addChild(Fight.layer.node);
	Fight.scene.layer=Fight.layer;


	
	

	//监听触摸事件
	Fight._touchListenser=cc.eventManager.addListener(
			{
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,                  
				onTouchBegan:	Fight.onTouchBegan,//触摸开始
				onTouchMoved : Fight.onTouchMoved,//触摸移动
				onTouchEnded :  Fight.onTouchEnded//触摸结束
			}, Fight.scene)
			//设定定时器

			//创建hit文字
			var hitImg=cu.get("Image_hit",this.layer)
			Fight._hitText=new CText();
	Fight._hitText.y=hitImg.y;
	Fight._hitText.x=hitImg.x-70;
	Fight.showHits(false)
	Fight.layer.node.addChild(Fight._hitText);
    

	//玩家血条
	var textHP=cu.get("Text_HP",Fight.layer);
	textHP.setString(Player.data.hp+"/"+Player.data.hp);
	Player.hp=Player.data.hp
	var LoadingBar_HP=cu.get("LoadingBar_HP",Fight.layer);
	LoadingBar_HP.setPercent(parseInt(Player.hp/Player.data.hp*100));
	
	//绑定怪物数据
	Fight.bindMonster();
},
Fight.showHits=function(rock)
{
	Fight._hitText.setText(2, Fight._hits,20)
	if (!rock)
		return;
	var action=cc.scaleTo(0.1, 1.5, 1.5)
	var action2=cc.scaleTo(0.1, 1, 1)
	Fight._hitText.runAction(cc.sequence(action,action2))

},
Fight.bindMonster=function()
{
	Fight.useTime=Fight.round.time;
	cu.playAnime(Fight.layer)
	cc.audioEngine.playEffect(soundRes.roundStart);

	//解析地图怪物数据
	for (var i in Fight.mapLayer.node.getChildren())
	{
		var obj=Fight.mapLayer.node.getChildren()[i];

		if(cf.is(obj,ccs.Armature))
		{

			if (!obj.userData)
				continue;
			if (!obj.userData.kind)
				continue;

			Monster.bind(obj)
		}
	}
	Fight.layer.node.schedule(Fight.update,1, cc.REPEAT_FOREVER);	
},

Fight.update=function()//帧执行函数
{
	Fight.useTime--;

	if (new Date().getTime()-Fight._lastAttackTime>1000)
	{
		Fight._hits=0;
		Fight._lastAttackTime=new Date().getTime();
		Fight.showHits(false);
	}

	var loadingBar=cu.get("LoadingBar_time")
	loadingBar.setPercent(parseInt(Fight.useTime/Fight.round.time*100));
	if(Fight.useTime<=0)
	{
		Fight.showResult(false)

	}
	else
	{
		//判断场景中是否还有怪物
		for(var i in Fight.mapLayer.node.getChildren())
		{
			var enemy=Fight.mapLayer.node.getChildren()[i];
			if (enemy.kind==1)
				if (enemy.hp>0)
					return;
		}
		Fight.state=1;
		Fight.clearRound();
	}
},
Fight.onTouchBegan=function(touch ,event){


	if (Fight._touched)
		return;		
	Fight._touched=true;
	Fight._startPos=touch.getLocation();
	Fight._lastPos=null;
	Fight._handInfo=[];
	Fight._handInfo.push(touch.getLocation())
	return true;
},
Fight.onTouchMoved = function(touch ,event){
	if (Fight._lastPos)
	{
		var angle1=cf.getAngle(Fight._startPos, Fight._lastPos);
		var angle2=cf.getAngle(Fight._lastPos,touch.getLocation());
		if (Math.abs(angle1-angle2)>30 && cf.getLength(Fight._startPos,Fight._lastPos)>50)
		{
			Fight._handInfo.push(touch.getLocation())
			Fight.createAttack(Fight._lastPos)
			Fight._startPos=Fight._lastPos;

		}
	}
	Fight._lastPos=touch.getLocation();

},
Fight.onTouchEnded =function(touch ,event){

	Fight._touched=false;
	Fight._handInfo.push(touch.getLocation())
	//判断是否V型手势
	if (Fight._handInfo.length==3)
	{
		var angle1=cf.getAngle(Fight._handInfo[0],Fight._handInfo[1]);
		var angle2=cf.getAngle(Fight._handInfo[1],Fight._handInfo[2]);

		if (0<angle1 && angle1<90 && 0>angle2 && angle2>-90 )
			Player.skill(1)
			if (0<angle2&& angle2<90 && 0>angle1 && angle1>-90 )
				Player.skill(2)
	}
	if (Fight._handInfo.length==4)
	{
		var angle1=cf.getAngle(Fight._handInfo[0],Fight._handInfo[1]);
		var angle2=cf.getAngle(Fight._handInfo[1],Fight._handInfo[2]);
		var angle3=cf.getAngle(Fight._handInfo[2],Fight._handInfo[3]);

		if (-45<angle1 && angle1<45 && 90<angle2 && angle2<180  &&-45<angle3 && angle3<45)
			Player.skill(3)

	}
	Fight.createAttack(touch.getLocation());

},
//判断攻击效果
Fight.createAttack=function(pos)
{

	var pos1=this._startPos;
	var pos2=pos;
	var length=cf.getLength(pos1,pos2);
	//判断是触摸方式点击还是滑动
	if (length<50)
	{  

		var eff=new cc.Sprite();
		cu.currScene().addChild(eff);
		//设定坐标
		eff.x=pos1.x;
		eff.y=pos1.y;
		eff.amimeTime=0.1;
		//加入动画
		cu.addMovie(eff,"res/eff_attack")
		cu.playMovie(eff)
		cu.free(eff,0.5);
		cc.audioEngine.playEffect(soundRes.hit);
	}
	else
	{
		var eff=new cc.Sprite("#res/eff_sword.png");
		cu.currScene().addChild(eff);
		//设定坐标和锚点
		eff.setAnchorPoint(cc.p(0,0.5));
		eff.x=pos1.x;
		eff.y=pos1.y;  
		//旋转角度
		var angle =cf.getAngle(pos1,pos2);
		eff.setRotation(angle);
		//根据滑动长度拉伸
		eff.setScale(length/eff.width,length/eff.width)
		cu.free(eff,0.5);
		cc.audioEngine.playEffect(soundRes.sword);
	}


	for(var i in this.mapLayer.node.getChildren())
	{
		var enemy=this.mapLayer.node.getChildren()[i];
		
		if (!enemy.kind)
			continue;
	
		if (length<50)
		{
			if (!cu.hitTest(enemy,pos2))
				continue;
		}
		else
			if (!cu.hitTestObj(enemy,eff))
				continue;
		
		this._hits++;
		this._lastAttackTime=new Date().getTime();
		
		//如果是场景,显示受击
		if (enemy.kind==3)
		{
			cu.beAttack(enemy)
			continue;
		}
		//如果是可被击落技能 消灭
		if (enemy.kind==2)
		{
			if (enemy.hp>0)
			{
				enemy.hp--;
				if (enemy.hp==0)
					MonsterSkill.die(enemy)
			}
			continue;
		}

		//手指滑动长度
		var power=length<50?1:length/400;
		var data=Main.getAttackData(Player.getData(),enemy.data)//计算扣除血量

		if(data.miss)//miss
		return Main.flyHP(enemy,data)
		data.hp=parseInt(data.hp*power)//根据手指滑动长度增加攻击力
		//播放受击效果
		if (enemy.kind==1)
		Monster.beAttack(enemy,data);


	}
	this.showHits(true);
	this.addSkillPower();
},
Fight.skillAttack=function(att,time,count)
{
	this._skillAtt=att;
	this.layer.node.schedule(this.onSkillTime,time/count, count);
},
Fight.onSkillTime=function()
{

	for(var i in Fight.mapLayer.node.getChildren())
	{
		var enemy=Fight.mapLayer.node.getChildren()[i];
		if (!enemy.kind)
			continue;
		if (enemy.hp<=0)
			continue;
		Fight._hits++;
		Fight._lastAttackTime=new Date().getTime();		
		//如果是可被击落技能 消灭
		if (enemy.kind==2)
		{
			MonsterSkill.die(enemy)
			continue;
		}
		//如果是场景,显示受击
		if (enemy.kind==3)
		{
			cu.beAttack(enemy)
			continue;
		}
		Fight._hits++;
		Fight._lastAttackTime=new Date().getTime();

		var data={};
		data.hp=Fight._skillAtt;
		data.miss=false;
		data.crt=false;
		//播放受击效果
		Monster.beAttack(enemy, data)

	}
	Fight.showHits(true);
},
//增长技能能量
Fight.addSkillPower=function()
{
	var skillBar1=cu.get("LoadingBar_1")
	var skillBar2=cu.get("LoadingBar_2")
	var skillBar3=cu.get("LoadingBar_3")
	Player.skill1Power+=10;
	skillBar1.setPercent(Player.skill1Power);
	Player.skill2Power+=5;
	skillBar2.setPercent(Player.skill2Power);
	Player.skill3Power+=1;
	skillBar3.setPercent(Player.skill3Power);
},

//显示结果
Fight.showResult=function(win,data)
{
	Fight.layer.node.unschedule(Fight.update);
	for(var i in Fight.mapLayer.node.getChildren())
		if (Fight.mapLayer.node.getChildren()[i].kind==1)
			Monster.stopAttack(Fight.mapLayer.node.getChildren()[i])
	
	this.state=win?1:2;	
	Result.create(win,data)
	if (win)
		Fight.layer.node.schedule(Fight.endDialog,2);
	else
		Fight.layer.node.schedule(Result.show,2);
	
},
//结束对话
Fight.endDialog=function()
{
	for (var i in Data.dialog)
		if (Data.dialog[i].roundID==Fight.round.ID && Data.dialog[i].type==1)
			return Dialog.showDialog(Data.dialog[i].ID,true,Result.show)
		Result.show();
}
//摇晃屏幕
Fight.rock=function()
{

	var action=cc.scaleTo(0.1, 1.05, 1.05)
	var action2=cc.scaleTo(0.1, 1, 1)
	this.mapLayer.node.runAction(cc.sequence(action, action2));
}

//通关
Fight.clearRound=function()
{

	cn.send(Data.homePage+"game/clear/call",Data.userName,Data.passWD,0,this.round.ID,this.useTime,1,
		function(data){
		Main.playEffect("box")
		cc.audioEngine.playEffect(soundRes.box);

		for (var i=0;i<parseInt(data.money/100);i++)
			Main.dropProps(0);

		for (var i=0;i<data.items.length;i++)
			Main.dropProps(data.items[i]);

		//扣除精力
		Player.data.power=data.power;
		
		Fight.showResult(true,data);

	})
}

