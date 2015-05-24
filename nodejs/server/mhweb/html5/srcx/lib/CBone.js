var CBone = cc.Sprite.extend(
		{
			armature:null,//骨骼动画
			ctor:function(fileName, rect, rotated){
				this._super(fileName, rect, rotated);
			},
			//加载骨骼文件
			loadBone:function(filename,name)
			{
				ccs.armatureDataanager.addArmatureFileInfo(filename);
				this.armature = ccs.Armature.create(name)
				this.addChild(this.armature); 
				this.width=this.armature.width;
				this.height=this.armature.height;
				this.armature.x=this.width/2
				this.armature.y=this.height/2
			},
			//设置骨骼对象
			setBone:function(armature)
			{
				this.width=armature.width;
				this.height=armature.height;

				this.x=armature.x;
				this.y=armature.y;
				//this.setScaleX(armature.getScaleX())
				//this.setScaleY(armature.getScaleY())

				this.armature = armature
				var parent=armature.getParent();
				armature.retain();
				armature.removeFromParent(false)
				this.userData=armature.userData;
				this.addChild(armature)
				armature.x=this.width/2
				armature.y=this.height/2
				parent.addChild(this);

			},			
			play:function(action,callBack)
			{	
				if (this.action==action)
					return;
				this.stop()
				this.action=action;
				this.armature.getAnimation().play(action);
				if (callBack)
					this.armature.getAnimation().setMovementEventCallFunc(callBack,this);
			},
			stop:function()
			{
				if (this.armature)
					if (this.armature.getAnimation())
					{
						this.armature.getAnimation().stop();
						this.armature.getAnimation().setMovementEventCallFunc(null,true);
					}
			},
			//释放对象
			free:function(fadeTime)
			{
				this.stop();
				if (this.armature)
					cu.free(this.armature,fadeTime)
					cu.free(this,fadeTime)
			}
		}
);