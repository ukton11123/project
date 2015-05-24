
//物品信息
function Item(){};
Item.layer=null;
Item.create=function(item,userItem,pos){

	
	//加载UI
	Item.free()
	
	this.layer=cu.loadScene(sceneRes.item)
	cu.currScene().addChild(this.layer.node)

	var button1=cu.get( "Button_1",this.layer);
	var button2=cu.get( "Button_2",this.layer);
	var button3=cu.get( "Button_3",this.layer);
	var color=Data.itemColorInfo[item.quality];
	var text=cu.get("Text_name",this.layer)
	
	
	text.setString(item.name);
	text.setColor(color)

	function createText(str,parent)
	{
		var text=cc.LabelTTF.create(str,cu.fontName,18);
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
		if (!userItem)
			return item[key]
		else
			return parseInt(item[key]+item[key]*userItem.level*Data.setup.strengAdd/100)
			+"("+parseInt(item[key]*userItem.level*Data.setup.strengAdd/100)+")"
	}
	var listView=cu.get("ListView_1",this.layer)
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


	cu.get( "Text_fight",this.layer).setString(Main.getItemFight(item,userItem));


	button1.setVisible(userItem)
	button2.setVisible(userItem)
	button3.setVisible(userItem)
	listView.setVisible(item.itemType==0)
	cu.get( "Text_1",this.layer).setVisible(item.itemType==0)
	cu.get( "Text_fight",this.layer).setVisible(item.itemType==0)
	if (item.itemType>0)
	cu.get( "Text_explain",this.layer).y+=50;
  
	var useName=["装备","使用","合成","打开","镶嵌","使用","使用"]
	if (userItem)
	{
		button3.titleText=useName[item.itemType];
		if (item.itemType==0 && userItem.equiped)
			button3.titleText="卸下"
		
	}
	if  (item.itemType>0)
	{
		button2.titleText=button3.titleText;
		button3.titleText+="全部";
	}
	var text=cu.get( "Text_pos",this.layer)
	text.setString(Data.itemTypeInfo[item.itemType][item.type]);
	var text=cu.get( "Text_level",this.layer)
	text.setString("需要"+item.needLevel+"级");		
	var text=cu.get( "Text_explain",this.layer)
	text.setString(item.itemExplain);	
	if(item.itemType==1)
	{
		var name=["体力","经验","金币","钻石"]
		text.setString("增加"+name[item.type]+item.value);	
	}	
    if(item.itemType==2)
     {
    	var pieceItem=Data.getData("item", item.items)
    	text.setString(item.pieceAmount+"个碎片合成1个"+pieceItem.name);	
     }
	var text=cu.get( "Text_price",this.layer)
	if (item.itemType==0)
		text.setString("售价    "+parseInt(Main.getItemFight(item)/5));	
	else
		text.setString("售价    1");	

	var itemImg=cu.get( "Image_item",this.layer)
	
	var itemIcon=ItemIcon.create(item, userItem)
	itemImg.addChild(itemIcon)
	cu.center(itemIcon)

	button1.addClickEventListener(
			function()
			{
				Bag.sellItem(userItem.ID)
				Item.free()
			});
	button2.addClickEventListener(
			function()
			{
				if (item.itemType==0)//装备
					Streng.create(userItem.ID)
				if (item.itemType>0)//非装备
					Bag.useItem(userItem.ID,1)
			});
	button3.addClickEventListener(
			function()
			{
				if (item.itemType==0)//装备
				Bag.sendEquipItem(userItem.ID)
				if (item.itemType>0)//非装备
					Bag.useItem(userItem.ID,userItem.amount)
					
				Item.free()

			});

	

	var width=400;
	var height=400;
	
	this.layer.node.x=Math.min(cc.winSize.width-width,pos.x)+20;
	this.layer.node.y=Math.max(0,pos.y-height/2);


	if (this.layer.node.x<0)
		this.layer.node.x=0;

	//为当前场景添加点击关闭功能
	cc.eventManager.addListener(
			{
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,      
				onTouchBegan:	function(touch ,event){return true},
				onTouchEnded :  function(touch ,event){
					Item.free()
				}
			}, Item.layer.node)


}
Item.free=function()
{
	if (Item.layer)
	{
		cu.free(Item.layer.node)
		Item.layer=null;
	}
}
