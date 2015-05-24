var CCheckBox = ccui.CheckBox.extend(
		{
			
			onChange:null,
			ctor:function(fileName, rect, rotated){
				this._super(fileName, rect, rotated);
				this.addEventListener(this.selectedStateEvent, this);
				this.loadTextures(
						"res/CheckBox_Normal.png",
						"res/CheckBox_Press.png",
						"res/CheckBoxNode_Normal.png",
						"res/CheckBox_Disable.png",
						"res/CheckBoxNode_Disable.png",1
				)
				this.setTouchEnabled(true)
			},
			selectedStateEvent: function (sender, type) {
				if (this.onChange)
					this.onChange(this,type==1)
			},
			setSize:function(w,h)
			{
				this.setScaleX(w/this.width)
				this.setScaleY(h/this.height)
			},
			setSelected:function(value)
			{
				this._super(value)
				if (this.onChange)
					this.onChange(this,value)
				
			}			
		})
