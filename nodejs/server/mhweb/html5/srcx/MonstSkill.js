//怪物技能静态类
function MonsterSkill(){};
//绑定技能
MonsterSkill.bind=function(monster)
{
	var arr=monster.data.skills.split(",")
	for (var i in arr)
	{
		var skill=new cc.Sprite();
		monster.addChild(skill);
		monster.skills.push(skill)
		skill.data=Data.getData("skill",arr[i]);
		skill.schedule(MonsterSkill.useSkill,skill.data.time+Math.random()*(skill.data.time/10), cc.REPEAT_FOREVER,skill.data.time);

	}
}
//施放技能
MonsterSkill.useSkill=function()
{
	this.getParent().play("skill",Monster.actionOver);//播放怪物技能动作
	Monster.speak(this.getParent(),"skill")

	var eff=new cc.Sprite("#res/eff_effect1.png");
	cu.currScene().addChild(eff)
	cu.center(eff);
	cu.setSize(eff,cc.winSize.width,cc.winSize.height);
	cu.free(eff,1)

	var skill=new cc.Sprite("#res/"+this.data.img);
	Fight.mapLayer.node.addChild(skill)
	skill.hp=this.data.clickCount;
	skill.data=this.data;
	skill.kind=2;
	skill.data.hit=999;//必定命中
	skill.data.att+=this.getParent().data.att;//技能攻击+怪物攻击

	if (skill.data.roll)//投掷
	{
		skill.x=Math.random()*(cc.winSize.width-200)+100;
		skill.y=Math.random()*(cc.winSize.height-500)+300;
		if (skill.data.rota)
			skill.runAction(cc.repeatForever(cc.rotateBy(0.3,360)))

			skill.setScale(0.5,0.5);
		var time=skill.data.showTime+Math.random()*skill.data.showTime/2;
		var jumpaction = cc.jumpBy(time, 0, -300*Math.random(), 100+200*Math.random(), 1)
		var action = cc.scaleTo(time, 2, 2)
		var finish=cc.callFunc(Player.beAttack,skill)
		skill.runAction(cc.sequence(cc.spawn(jumpaction,action),finish))
	}
	else
	{
		cu.center(skill);
		var action = cc.delayTime(skill.data.showTime)
		var finish=cc.callFunc(Player.beAttack,skill)
		skill.runAction(cc.sequence(action,finish))
	};

	cc.audioEngine.playEffect(soundRes.skill);
}
MonsterSkill.die=function(skill)
{
	skill.stopAllActions();
	cu.free(skill,0.5)
	
	var block=new cc.Sprite();
	skill.addChild(block);
	//设定坐标
	cu.center(block)
	block.amimeTime=0.1;
	//加入动画
	cu.addMovie(block,"res/blok")
	cu.playMovie(block)
}
