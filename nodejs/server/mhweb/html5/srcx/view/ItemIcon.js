//物品图标静态类
function ItemIcon(){};
ItemIcon.create=function(item,userItem,checkBox){

	var sprite=new cc.Sprite("#res/item_bg_"+item.quality+".png");
	sprite.cascadeOpacity=true; 
	sprite.item=item;
	sprite.userItem=userItem;
	sprite.checkBox=checkBox;
	var itemSprite=new cc.Sprite("res/item/"+item.img)
	sprite.addChild(itemSprite)
	cu.center(itemSprite)

	//显示数量
	if (userItem)
		if (userItem.amount>1)
		{
			var txt=cc.LabelTTF.create("x"+userItem.amount,cu.fontName);
			txt.setFontSize(14)
			txt.setColor(cc.color(255,255,255));
			txt.enableStroke(cc.color(0,0,0),3)
			sprite.addChild(txt)		
			txt.x=sprite.width-15;
			txt.y=10
		}
	//显示碎片
		if (item.itemType==2)
		{
			var piece=new cc.Sprite("#res/piece.png")
			sprite.addChild(piece)		
			piece.x=15;
			piece.y=sprite.height-15
			cu.setSize(piece,20,20)
		}
	//显示强化
	if(userItem)
	{
		if (userItem.level>0)
		{
			var txt=cc.LabelTTF.create("+"+userItem.level,cu.fontName);
			txt.setAnchorPoint(cc.p(0,0.5));
			txt.setFontSize(14)
			txt.setColor(cc.color(255,255,255));
			txt.enableStroke(cc.color(55,55,55),2)
			sprite.addChild(txt)		
			txt.x=5;
			txt.y=sprite.height-10
		}
	}

	cu.addClickEventListener(sprite,
			function(sprite,pos)
			{


		if (sprite.checkbox)
			sprite.checkbox.setSelected(!sprite.checkbox.isSelected())
			else
				Item.create(sprite.item,sprite.userItem,pos)

			},
			checkBox?function()
					{
				Item.create(item,userItem,cu.getTouchPos(sprite))
					}:null,false);

	//战斗力比较图标
	sprite.fightCompareSprite=new cc.Sprite()
	sprite.addChild(sprite.fightCompareSprite)

	sprite.fightCompareSprite.x=10
	sprite.fightCompareSprite.y=15	

	this.showFightCompare(sprite);

	if (checkBox)
	{

		sprite.checkbox=new CCheckBox();
		sprite.addChild(sprite.checkbox)
		sprite.checkbox.setSize(18,18)
		sprite.checkbox.x=sprite.width-10;
		sprite.checkbox.y=10
	}
	return sprite;

},
//比较战斗力
ItemIcon.showFightCompare=function(sprite)
{
	if (sprite.item.itemType==0)
	{
		var equipedItem=null;
		for (var i in Player.items)
			if(Player.items[i].equiped)
				if (Data.getData("item",Player.items[i].itemID).type==sprite.item.type)
					equipedItem=Player.items[i];

		var img=equipedItem?"":"res/up.png";
		if (equipedItem){
			var fight1=Main.getItemFight(sprite.item,sprite.userItem);
			var fight2=Main.getItemFight(Data.getData("item",equipedItem.itemID),equipedItem);
			if(fight1>fight2)
				img="res/up.png"
					if(fight1<fight2)
						img="res/down.png"
		}
		if (img)
			cu.setImg(sprite.fightCompareSprite,img,true);
		sprite.fightCompareSprite.setVisible(img)
	}
}

