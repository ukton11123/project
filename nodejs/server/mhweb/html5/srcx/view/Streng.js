
//强化场景静态类
function Streng(){};
Streng.layer=null;
Streng.menuLayer=null;
Streng.infoLayer=null;
Streng.strengItem=null;	
Streng._selectStreng=false;
Streng._strengArr=[];
Streng.create=function (strengItem) {
	Main.onKeyPress()
	this.strengItem=strengItem;
	//加载主layer
	this.layer=cu.newScene(sceneRes.streng,this.onEnter);
	
	//加载信息layer
	this.layer.node.addChild(Info.create());
	
	//加载菜单layer
	this.layer.node.addChild(Menu.create());
	Menu.setButton("Button_streng")
	
}
Streng.onEnter=function()
{
	
	cu.get("Button_select").addClickEventListener(
			function()
			{
				Streng.scroll(true)
				Streng.showItem(true);
			});
	cu.get("Button_add").addClickEventListener(
			function()
			{
				Streng._strengArr=[];
				Streng.createGrid("ScrollView_2")
				Streng.scroll(true)
				Streng.showItem(false);
			});		
	cu.get("Button_return").addClickEventListener(
			function()
			{
				Streng.scroll(false)
			});
	cu.get("Button_finish").addClickEventListener(
			function()
			{
				Streng.finishSelect();
			});
	cu.get("Button_streng").addClickEventListener(
			function()
			{
				Streng.streng();
			});
	
	Streng.createGrid("ScrollView_2")

	cu.get("CheckBox_all").addClickEventListener(function(){Streng.selectItem(-1,!this.isSelected())});	
	cu.get("CheckBox_0").addClickEventListener(function(){Streng.selectItem(0,!this.isSelected())});		
	cu.get("CheckBox_1").addClickEventListener(function(){Streng.selectItem(1,!this.isSelected())});
	cu.get("CheckBox_2").addClickEventListener(function(){Streng.selectItem(2,!this.isSelected())});
	cu.get("CheckBox_3").addClickEventListener(function(){Streng.selectItem(3,!this.isSelected())});
	cu.get("CheckBox_4").addClickEventListener(function(){Streng.selectItem(4,!this.isSelected())});

	Streng.getUserItem();


},
//获取用户物品
Streng.getUserItem=function()
{
	
	cn.send(Data.homePage+"game/item/get",Data.userName,
			function(data){
	
		Player.items=data;
		if (this.strengItem)
			this.setStrengItem(this.strengItem.ID)
	});	
}
//窗口滚动
Streng.scroll=function(toBag)
{
	var panel=cu.get("Panel_main");
	var action=cc.moveBy(0.5, cc.p(toBag?-cc.winSize.width:cc.winSize.width,0))
	panel.runAction(action)
},
//放置强化装备
Streng.setStrengItem=function(ID)
{

	if (this._strengItem)
	cu.free(this._strengItem);
	var userItem=Player.getItem(ID)
	var Equip_bg=cu.get("Equip_bg");
	var item=Data.getData("item",userItem.itemID);
	var itemIcon= ItemIcon.create(item,userItem)
	Equip_bg.addChild(itemIcon);
	cu.center(itemIcon)
	this._strengItem=itemIcon;
	cu.get( "LoadingBar_exp").setValue(userItem.exp,Player.getItemMaxExp(userItem));
	var name=cu.get("Text_name");
	name.setString(item.name)
	if (userItem.level>0)
		name.setString(item.name+"  +"+userItem.level)
		name.setColor(Data.itemColorInfo[item.quality])
		cu.get("Text_fight").setString(Main.getItemFight(item,userItem))

		function createText(str,parent)
	{
		var text=cc.LabelTTF.create(str,cu.fontName,16);
		text.setAnchorPoint(cc.p(0,0.5));
		var bg = new ccui.Layout();
		bg.width = parent.width;
		bg.height=20;

		text.x = 0;
		text.y = bg.height / 2;
		bg.addChild(text);
		parent.pushBackCustomItem(bg);
	}
	function getStrengValue(key,item,userItem)
	{
		if (userItem)
			return item[key]
		else
			return parseInt(item[key]+item[key]*userItem.level*Data.setup.strengAdd/100)
			+"("+parseInt(item[key]*userItem.level*Data.setup.strengAdd/100)+")"
	}
	var listView=cu.get("ListView_1",this.layer)
	listView.removeAllChildren() 
	if (item.att)
		createText("攻击            +"+getStrengValue("att",item,userItem),listView)
		if (item.def)
			createText("防御            +"+getStrengValue("def",item,userItem),listView)
			if (item.hp)
				createText("耐力            +"+item.hp,listView);
	if (item.crt)
		createText("暴击            +"+item.crt+"%",listView);
	if (item.aov)
		createText("闪避            +"+item.aov+"%",listView);
	if (item.hit)
		createText("命中            +"+item.hit+"%",listView)
},
//显示背包物品
Streng.showItem=function(streng)
{
	this._selectStreng=streng;
	Player.shortItem()

	this.createGrid("ScrollView_bag")
	//创建物品
	if (streng)
		for (var i in Player.items)
			if (Player.items[i].equiped)
			{
				this.createItem(Player.items[i].ID,"ScrollView_bag")
			}

	for (var i in Player.items)
		if (!Player.items[i].equiped)
		{

			this.createItem(Player.items[i].ID,"ScrollView_bag")
		}

},
//绘制网格
Streng.createGrid=function(scrollViewName)
{

	var scrollView=cu.get(scrollViewName);
	scrollView.removeAllChildren(true)
	//创建背包格子
	for (var i=0;i<Data.maxBagGrid;i++)
	{
		var bg=new cc.Sprite("#res/item_bg.png");
		scrollView.addNode(bg);
		var col=parseInt(scrollView.width/bg.width)
		bg.x=(i% col)*(bg.width+6)+bg.width/2;
		bg.y=scrollView.innerHeight -bg.height/2-parseInt(i/ col)*(bg.height+6);
	}
},
//创建物品
Streng.createItem=function(ID,scrollViewName)
{
	var userItem=Player.getItem(ID)
	var item=Data.getData("item",userItem.itemID);
	if(item.itemType>0)
		return;
	if (this._strengItem)
		if (this._strengItem.userItem==userItem)
			return;
	if (this._strengArr.indexOf(userItem)!=-1)
		return;
	var scrollView=cu.get(scrollViewName);
	var itemIcon=ItemIcon.create(item,userItem,true)
	if (scrollViewName=="ScrollView_2")
	{
		itemIcon.checkbox.setSelected(true)
		itemIcon.checkbox.onChange=function(sender,checked){
			Streng._strengArr.splice(Streng._strengArr.indexOf(sender.getParent().userItem.ID),1)
			sender.getParent().free()
			cu.get("Text_money").setString(Streng.getStrengMoney())
		}
	}

	for (var j in scrollView.getChildren())
	{
		var grid=scrollView.getChildren()[j]
		if (grid.getChildrenCount()==0)
		{
			cu.setParent(itemIcon,grid)
			return;
		}
	}
},
//选择装备
Streng.selectItem=function(type,value)
{

	var scrollView=cu.get("ScrollView_bag");
	for (var i in scrollView.getChildren())
	{
		var grid=scrollView.getChildren()[i]
		if (grid.getChildrenCount()==0)
			continue;
		var itemIcon=grid.getChildren()[0];
		if (type>=0 && itemIcon.item.quality!=type)
			continue;
		itemIcon.checkbox.setSelected(value);

	}
},
//选择完毕
Streng.finishSelect=function()
{
	var itemArr=[];
	var scrollView=cu.get("ScrollView_bag");
	for (var i in scrollView.getChildren())
	{
		var grid=scrollView.getChildren()[i]
		if (grid.getChildrenCount()==0)
			continue;
		var itemIcon=grid.getChildren()[0];
		if (!itemIcon.checkbox.isSelected())
			continue;
		itemArr.push(itemIcon.userItem.ID);

	}

	if (this._selectStreng )
	{
		if (itemArr.length!=1)
			return Dialog.showMsg("必须选择一个装备进行强化。")
			this.setStrengItem(itemArr[0])
			this.scroll(false)
	}
	else
	{
		if (itemArr.length==0)
			return Dialog.showMsg("至少选择一个装备作为强化材料。")
			var ScrollView2=cu.get("ScrollView_2");
		for (var i in itemArr)
			this.createItem(itemArr[i],"ScrollView_2")

			this.scroll(false)
			this._strengArr=itemArr;

		cu.get("Text_money").setString(this.getStrengMoney())
	}
},
//获取强化金币
Streng.getStrengMoney=function()
{
	var money=0;
	for (var i in this._strengArr)
	{
		var userItem=Player.getItem(this._strengArr[i])
		var item=Data.getData("item",userItem.itemID);
		money+=(item.quality+1)*item.needLevel*Data.setup.strengMoney;

	}
	return money;
},
//开始强化
Streng.streng=function()
{
	if (!this._strengItem)
		return Dialog.showMsg("必须选择一个装备进行强化。")
		if (this._strengArr.length==0)
			return Dialog.showMsg("必须选择装备作为材料。")
			Streng.sendStrengItem(this._strengItem.userItem.ID,this._strengArr)
},
//强化结果
Streng.strengResult=function(id,exp)
{
	var userItem=Player.getItem(id)
	userItem.exp+=exp;

	cu.get( "LoadingBar_exp").setValue(userItem.exp,Player.getItemMaxExp(userItem),true,function(sender){
		//播放升级动画
		Main.playEffect("levelUp");
		cc.audioEngine.playEffect(soundRes.levelUp)
		userItem.exp-=Player.getItemMaxExp(userItem);
		userItem.level++;

		sender.setMaxValue(Player.getItemMaxExp(userItem));
		Streng.setStrengItem(id)
	});
	cc.audioEngine.playEffect(soundRes.streng);
	Main.playEffect("streng");
	this.createGrid("ScrollView_2")
}


//强化物品
Streng.sendStrengItem=function(id,ids)
{

	cn.send(Data.homePage+"game/item/streng",Data.userName,Data.passWD,id,ids,
			function(id,ids,exp,money){

		var idArr=ids.split(",")
		for (var i in idArr)
		{
			var userItem=Player.getItem(idArr[i]);
			if (Player.items.indexOf(userItem)!=-1)
				Player.items.splice(Player.items.indexOf(userItem),1)
		}
		Player.data.money-=money;
		Dialog.showGetItem("money",-money)
		Streng.strengResult(id,exp)
	});	  
}

