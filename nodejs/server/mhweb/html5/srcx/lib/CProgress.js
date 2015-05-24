
var CProgress = ccui.Widget.extend(
		{
			loadingBar:null,
			bgSprite:null,
			_maxValue:0,
			_toValue:0,
			_speed:2,
			_sub:false,
			_callback:null,
			ctor:function(textureName, percentage){
				this._super(textureName, percentage);

				this.loadingBar=ccui.LoadingBar.create();
				this.loadingBar.setPercent(0);
			},
			setLoadingBar:function(loadingBar)
			{
				
			},
			setImg:function(img)
			{
				this.bgSprite=new cc.Sprite();
				cu.setImg(this.bgSprite, img, true)
				this.addChild(this.bgSprite)
				this.bgSprite.setColor(cc.color(50,50,50))
				cu.center(this.bgSprite);

				this.loadingBar.loadTexture(img,1);
				this.addChild(this.loadingBar)
				this.loadingBar.x=this.width/2
				this.loadingBar.y=this.height/2;
				this.loadingBar.setPercent(0);
			}, 
			setSize:function(w,h)
			{
				this.setScaleX(w/this.loadingBar.width)
				if(h)
					this.setScaleY(h/this.loadingBar.height)
			},
			setValue:function(value,maxValue,tween,callback)
			{
				if (!tween)
					{
						this.loadingBar.setPercent(value/maxValue*100);
					}
				else
				{
					this._toValue=value;
					this._maxValue=maxValue;
					this._sub=this.getPercent()>value/maxValue*100;
				
					this._callback=callback;
					this.schedule(this._update,0.01,cc.REPEAT_FOREVER);
				}
			},

			setPercent:function(value,tween)
			{
				if (!tween)
					this.loadingBar.setPercent(value);
				else
				{
					this._toValue=value;
					this._maxValue=100;
					this._sub=this.getPercent()>this._toValue/this._maxValue*100;

					this.schedule(this._update,0.01,cc.REPEAT_FOREVER);
				}
			},
			_update:function()
			{
				if (this._sub)
				{
					this.setPercent(this.getPercent()-this._speed);
					if(this.getPercent()<=0)
					{
						this._toValue+=this._maxValue;
						
						this.setPercent(100);
						if (this._callback)
							this._callback(this)
					}
					if(this.getPercent()<=this._toValue/this._maxValue*100)
					{
						this.setPercent(this._toValue/this._maxValue*100);
						this.unschedule(this._update)
					}					
				}
				else
				{
					
					this.setPercent(this.getPercent()+this._speed);
					if(this.getPercent()>=100)
					{
						this._toValue-=this._maxValue;
						this.setPercent(0);
						if (this._callback) 
							this._callback(this)
					}
					if(this.getPercent()>=this._toValue/this._maxValue*100)
					{
						this.setPercent(this._toValue/this._maxValue*100);
						this.unschedule(this._update)
					}					
				}

			},
			getPercent:function()
			{
				return this.loadingBar.getPercent();
			},
			setMaxValue:function(value)
			{
				this._maxValue=value;
			}
		});