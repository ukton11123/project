
//背包场景静态类
function Bag(){};
Bag.layer=null;
Bag.menuLayer=null;
Bag.infoLayer=null;
Bag.create=function () {
	Main.onKeyPress()
	//加载主layer
	this.layer=cu.newScene(sceneRes.bag);

	//加载信息layer
	this.layer.node.addChild(Info.create());

	//加载菜单layer
	this.layer.node.addChild(Menu.create());
	Menu.setButton("Button_bag")

	this.getUserItem();
	cu.get("Button_sort",this.layer).addClickEventListener(function(){
		Bag.showItem()
	});	
}



//获取用户物品
Bag.getUserItem=function()
{

	cn.send(Data.homePage+"game/item/get",Data.userName,
			function(data){
		Player.items=data;
		Bag.showItem();
	});	
}
//显示背包物品
Bag.showItem=function()
{
	this.showPlayerInfo();
	Player.shortItem()
	for (var i=0;i<6;i++)
		cu.get("Equip_"+i).removeAllChildren(true)

		var listView=cu.get("ScrollView");
	listView.removeAllChildren(true)
	//创建背包格子
	for (var i=0;i<Data.maxBagGrid;i++)
	{
		var bg=new cc.Sprite("#res/item_bg.png");
		listView.addNode(bg);
		var col=parseInt(listView.width/bg.width)
		bg.x=(i% col)*(bg.width+6)+bg.width/2;
		bg.y=listView.innerHeight -bg.height/2-parseInt(i/ col)*(bg.height+6);
	}
	//创建物品
	for (var i in Player.items)
		this.createItem(Player.items[i]);

},
//显示人物数值
Bag.showPlayerInfo=function()
{
	cu.get("Text_att").setString("攻击     "+Player.getValue("att"));
	cu.get("Text_def").setString("防御     "+Player.getValue("def"));
	cu.get("Text_health").setString("耐力     "+Player.getValue("hp"));
	cu.get("Text_crt").setString("暴击     "+Player.getValue("crt"));
	cu.get("Text_hit").setString("命中     "+Player.getValue("hit"));
	cu.get("Text_aov").setString("闪避     "+Player.getValue("aov"));
	var total=Player.getValue("att")
	+Player.getValue("att")
	+Player.getValue("hp")
	+Player.getValue("crt")*10
	+Player.getValue("aov")*10
	+Player.getValue("hit")/10;
	cu.get("Text_fight").setString(parseInt(total));

},  
//创建物品图标
Bag.createItem=function(userItem)
{ 
	var item=Data.getData("item",userItem.itemID);
	var itemIcon=ItemIcon.create(item,userItem)

	//查找装备栏空位
	if (userItem.equiped)
		this.intoBody(itemIcon)
		else//查找背包空位放置物品
			this.intoBag(itemIcon);
},
//物品放入身上
Bag.intoBody=function(itemIcon,fly)
{
	var equipImg=cu.get("Equip_"+itemIcon.item.type);
	cu.setParent(itemIcon, equipImg)
},
//物品放入背包
Bag.intoBag=function(itemIcon,fly)
{

	var listView=cu.get("ScrollView");
	for (var i in listView.getChildren())
	{
		var grid=listView.getChildren()[i]
		if (grid.getChildrenCount()==0)
			return cu.setParent(itemIcon, grid)
	}
},
//获取物品图标
Bag.getItemIcon=function(ID,bag)
{
	if (bag)
	{
		var listView=cu.get("ScrollView");
		for (var i in listView.getChildren())
		{
			var grid=listView.getChildren()[i]
			if (grid.getChildrenCount()>0)
				if (grid.getChildren()[0].userItem.ID==ID)
					return grid.getChildren()[0]
		}
	}
	else
	{


		for (var i=0;i<6;i++)
		{
			var grid=cu.get("Equip_"+i);
			for (var j in grid.getChildren())
				if (grid.getChildren()[j].userItem.ID==ID)
					return grid.getChildren()[j];

		}
	}
},
//装备物品
Bag.equipItem=function(itemID,equiped,unEquidID)
{
	var userItem=Player.getItem(itemID)
	if (!userItem)
		return;
	var item=Data.getData("item",userItem.itemID)
	if (!item)
		return;		
	userItem.equiped=equiped;

	if (unEquidID)
	{
		userItem=Player.getItem(unEquidID)
		userItem.equiped=0;
	}
	//装备物品
	if (equiped)
	{
		var itemIcon=this.getItemIcon(itemID, true);
		this.intoBody(itemIcon)
		ItemIcon.showFightCompare(itemIcon);
	}
	else//卸下物品
	{
		var itemIcon=this.getItemIcon(itemID);
		cc.log("卸下物品"+itemIcon)
		this.intoBag(itemIcon)
		ItemIcon.showFightCompare(itemIcon);
	}

	//卸下物品
	if (unEquidID)
	{
		userItem=Player.getItem(unEquidID)
		userItem.equiped=0;
		var itemIcon=this.getItemIcon(unEquidID);

		this.intoBag(itemIcon)
	}

	cc.audioEngine.playEffect(soundRes.equip)
	//更新面板数值
	Bag.showPlayerInfo()
	//更新背包战斗力比较
	var listView=cu.get("ScrollView");
	for (var i in listView.getChildren())
	{
		var grid=listView.getChildren()[i]
		for (var j in grid.getChildren())
			ItemIcon.showFightCompare(grid.getChildren()[j]);
	}

},
//删除物品
Bag.delItem=function(id)
{
	var itemIcon=this.getItemIcon(id,true);
	if (!itemIcon)
		return;
	cu.free(itemIcon)
	var userItem=Player.getItem(id);
	Player.items.splice(Player.items.indexOf(userItem),1)

}



//使用物品
Bag.useItem=function(id,amount)
{

	cn.send(Data.homePage+"game/item/use",Data.userName,Data.passWD,id,amount,
			function(id,amount,items){
		var userItem=Player.getItem(id);
		if (!userItem)
			return;
		var item=Data.getData("item", userItem.itemID)
		if (!item)
			return;
		if (item.itemType==1) //消耗品
		{
			if (item.type==0) //体力
			{
				Dialog.showGetItem("power",item.value*amount)
			}
			if (item.type==1) //经验
			{
				Dialog.showGetItem("exp",item.value*amount)
			}
			if (item.type==2) //金币
			{
				Dialog.showGetItem("money",item.value*amount)

			}			
			if (item.type==3) //钻石
			{
				Dialog.showGetItem("token",item.value*amount)
			}
			Info.getInfo();
		}
		if (items)
		{
			for (var i in items)
			{
				var item=Data.getData("item", items[i])
				Dialog.showGetItem(item.ID,1,i)
			}
		}
		Bag.getUserItem()



	});	
}

//装备物品
Bag.sendEquipItem=function(id)
{

	cn.send(Data.homePage+"game/item/equip",Data.userName,Data.passWD,id,
			function(userItemID,equiped,unEquidID){
		cc.log(userItemID+"/"+equiped+"/"+unEquidID)
		Bag.equipItem(userItemID,equiped,unEquidID);

	});	
}
//卖出物品
Bag.sellItem=function(ids)
{
	cn.send(Data.homePage+"game/item/sell",Data.userName,Data.passWD,ids,
			function(ids,money){
		var idArr=ids.split(",")
		for (var i in idArr)
		{
			Bag.delItem(idArr[i])
			Player.data.money+=money;
			Dialog.showGetItem("money",money)
		}
	});	  
}