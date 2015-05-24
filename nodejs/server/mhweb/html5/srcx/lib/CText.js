var CText = cc.Sprite.extend(
		{
			
			ctor:function(fileName, rect, rotated){
				this._super(fileName, rect, rotated);
				
			},
			setText :function(type,txt,width)//设置数值
			{
				this.removeAllChildren(true)
				var Str=txt.toString();
				for (var i=0;i<Str.length;i++)
					{
					var sprite=new cc.Sprite("#res/txt_"+type+"_"+Str[i]+".png");
					sprite.x=i*width;
					this.addChild(sprite);
					} 
			},
			free:function(time){
				
				for (var i=0;i<this.getChildren().length;i++)
				{
					var action = cc.fadeOut(time)
					this.getChildren()[i].runAction(action)
				}
			}
		}
);