
function Monster(){};
Monster._speakArr={
		"start":[1,"勇士,来一场真正的较量","哪里来的毛小子,竟敢惹本爷爷","!!!!!!!!"],
		"attack":[0.2,"吃我一拳","能接住这招吗","@!#%@#$@#$"],
		"beAttack":[0.1,"酸酸甜甜有点疼","能不能不打脸","@!#%@#$@#$"],
		"skill":[0.5,"受死吧,勇士","明年的今天就是你的祭日"],
		"die":[0.5,"甘拜下风","算你狠,下次再找你算账"],
},
//绑定怪物数据
Monster.bind=function(armature)
{
	var monster=new CBone();
	monster.setBone(armature);
	//绑定怪物数据
	monster.data=Data.getData("monster", monster.userData.id);
	monster.kind=monster.userData.kind;

	monster.hp=monster.data.hp;
	//创建血条
	monster.hpBar=new CProgress()
	monster.hpBar.setImg("res/bloodBar2.png")
	monster.addChild(monster.hpBar)
	cu.center(monster.hpBar)
	monster.hpBar.y=monster.height+monster.hpBar.height+20;
	
	//设置定时器，普通攻击
	var time=monster.data.attTime+Math.random()*(monster.data.attTime/10);
	monster.schedule(this.onAttackTimer,time, cc.REPEAT_FOREVER);

	this.speak(monster,"start")
	//绑定技能
	monster.skills=[];
	MonsterSkill.bind(monster)
}
Monster.onAttackTimer=function(){
	Monster.speak(this,"attack")
	this.play("attack",Monster.actionOver);
	Player.beAttack(this)
}, 

//说话
Monster.speak=function(monster,action)
{

	var rate=this._speakArr[action][0];
	if (Math.random()>rate)
		return;
	var index=parseInt(Math.random()*(this._speakArr[action].length-1)+1)
	var text=this._speakArr[action][index];
	if (!monster.dialog)
	{
		monster.dialog=new cc.Sprite("#res/dialog.png");
		monster.dialog.x=monster.width/2;
		monster.dialog.y=monster.height+monster.dialog.height;
		monster.addChild(monster.dialog)
		monster.dialog.setOpacity(0);
		monster.dialog.cascadeOpacity=true; 
		
		monster.text=cc.LabelTTF.create("");
		monster.text.x =monster.dialog.width / 2;
		monster.text.y =monster.dialog.height / 2;
		monster.text.setColor(cc.color(0,0,0))
		monster.text.setFontName(cu.fontName)
		monster.dialog.addChild(monster.text);

	}
	
	monster.text.setString(text);
	monster.dialog.setOpacity(0);
	var fadein=cc.fadeIn(1);
	var delay=cc.delayTime(2);
	var fadeout=cc.fadeOut(1);
	monster.dialog.runAction(cc.sequence(fadein,delay,fadeout))
},

//受击效果
Monster.beAttack=function(monster,data){

	monster.hp-=data.hp;
	if (monster.hp<=0)
		Monster.die(monster);
	Main.flyHP(monster,data)
	if  (monster.action!="attack" && monster.hp>0)
		monster.play("beAttack",Monster.actionOver);

	Monster.speak(monster,"beAttack")
	monster.hpBar.setPercent(parseInt(monster.hp/monster.data.hp*100));

},
//动作播放完毕
Monster.actionOver=function(){
	this.play("stand",Monster.actionOver);
},
//停止攻击
Monster.stopAttack=function(monster)
{
	for (var i in  monster.skills)
		{
			monster.skills[i].unschedule(MonsterSkill.useSkill); 
			cu.free(monster.skills[i])
		}
		monster.skills=[]
	monster.unschedule(this.onAttackTimer); 
},

//死亡
Monster.die=function(monster)
{
	this.stopAttack(monster);
	
	Monster.speak(monster,"die")
	monster.play("die",this.onFinish);
},
Monster.onFinish=function()
{
	this.free(1)
}