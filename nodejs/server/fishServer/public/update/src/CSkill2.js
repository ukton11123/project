var CSkill = CSprite.extend(
		{
			ctor:function(fileName, rect, rotated){
				this._super(fileName, rect, rotated);
			},
			data:null,
			monsterAtt:0,
			setData:function(monster,skill)
			{
				
				this.data=skill;
				this.monsterAtt=monster.data.att;
				if (skill.roll)//投掷
					{
						//this.setTexture("#eff_skill"+skill.NO+".png")
						this.x=Math.random()*(cc.winSize.width-200)+100;
						this.y=Math.random()*(cc.winSize.height-400)+300;
						if (skill.rota)
						this.rotateAtuo(0.2);  
						this.setScale(0.5,0.5);
						var time=skill.showTime+Math.random()*skill.showTime/2;
						var jumpaction = cc.jumpBy(time, 0, -300*Math.random(), 300*Math.random(), 1)
						var action = cc.scaleTo(time, 2, 2)
						var finish=cc.callFunc(CPlayer.beAttack,this)
						
						this.runAction(cc.sequence(cc.spawn(jumpaction,action),finish))
					}
				else
					{
						this.setCenter();
						var action = cc.delayTime(skill.showTime)
						var finish=cc.callFunc(CPlayer.beAttack,this)
						this.runAction(cc.sequence(action,finish))
					}
				
				cc.audioEngine.playEffect(res.skill_mp3);
			},  
			die:function()
			{
				this.stopAllActions();
				this.free(1)
			}
		}
);