//任务完成界面
function Finished(){};
Finished.layer=null;
Finished.create=function(type,name,money,exp,token,items){
     
	//加载UI 
	if(this.layer)
	{
		cu.free(this.layer.node)
		this.layer=null;
	}

	this.layer=cu.loadScene(sceneRes.Finished)
	cu.currScene().addChild(this.layer.node); 
	cu.get("Text_close",this.layer).addClickEventListener(
			function()
			{	
				cu.free(Finished.layer.node)
				Finished.layer=null;
			});
	if (type==1)
		cu.get("Image_1", this.layer).loadTexture("res/finish5.png",1)
	cu.get("Text_title", this.layer).setString(name);
	cu.get("Text_money", this.layer).setString(money);
	cu.get("Text_exp", this.layer).setString(exp);
	cu.get("Text_token", this.layer).setString(token);

	cu.get("Text_money", this.layer).setVisible(money)
	cu.get("Text_exp", this.layer).setVisible(exp)
	cu.get("Text_token", this.layer).setVisible(token)
	cu.get("Image_money", this.layer).setVisible(money)
	cu.get("Image_exp", this.layer).setVisible(exp)
	cu.get("Image_token", this.layer).setVisible(token)


	//显示掉落
	var panel=cu.get("ScrollView_item",this.layer);
	var itemsArr=items.split(",");
	for (var i in itemsArr)
	{
		if (!itemsArr[i])
			continue;
		var item=Data.getData("item",itemsArr[i]);
		var itemIco=ItemIcon.create(item)
		itemIco.x=5+itemIco.width/2+i*(itemIco.width+5);
		itemIco.y=panel.innerHeight/2
		panel.addChild(itemIco);
	}
	
	var width=itemIco?itemIco.width:0;
	panel.innerWidth=10+itemsArr.length*(width+5)
	cu.playAnime(this.layer,false)
}
