
//关卡静态类
function Round(){};
Round.layer=null;
Round.create=function(partID,roundID){

	//加载UI
	this.layer=cu.loadScene(sceneRes.round)
	cu.currScene().addChild(this.layer.node)
	var pageView=cu.get("PageView",this.layer)
	pageView.addEventListener(this.pageViewEvent, this);  
	var title=cu.get( "Text_title",this.layer);
	var part=Data.getData("part",partID)
	title.setString(part.name);
	var button=cu.get( "Button_left",this.layer);
	button.setVisible(false);

	button.addClickEventListener(
			function()
			{
				pageView.scrollToPage(pageView.getCurPageIndex()-1) 
			});				
	var button=cu.get( "Button_right",this.layer);
	button.addClickEventListener(
			function()
			{
				pageView.scrollToPage(pageView.getCurPageIndex()+1) 
			});		
	var button=cu.get("Button_close",this.layer)
	button.addClickEventListener(
			function()
			{
				cu.free(Round.layer.node)
			});		
	var count=0;
	for(var i in Data.round)
	{
		var round=Data.round[i];
		if (round.partID!=partID)
			continue;
		count++;
		if (count==1)
			this.showRound(round.ID);
		// 组织pageview
		var layout = new ccui.Layout();  
		layout.ID=round.ID;
		layout.setContentSize(pageView.width, pageView.height);

		var roundItem=cu.loadScene(sceneRes.roundItem);

		layout.addChild(roundItem.node); 

		var img = cu.get("Image_ico", roundItem);
		var face;
		if(!round.roleID)
			face="res/map/round/ico.png";
		else
			face="res/face/"+Data.getData("role", round.roleID).face;
		img.loadTexture(face);
		if (Player.getRound(round.ID))
		{
			if (Player.getRound(round.ID).star>0)
				cu.get("star_1", roundItem).loadTexture("res/star.png",1);
			if (Player.getRound(round.ID).star>1)
				cu.get("star_2", roundItem).loadTexture("res/star.png",1);
			if (Player.getRound(round.ID).star>2)
				cu.get("star_3", roundItem).loadTexture("res/star.png",1);
		}
		cu.get("Text_name", roundItem).setString(round.name);

		layout.index=i;
		layout.addClickEventListener(function(sender){
			sender.getParent().scrollToPage(sender.index) 
		})
		// 加入到pageview  
		pageView.addPage(layout);  	
		layout.open=this.checkRoundOpen(round.ID);
		layout.cascadeColor =true; 
		layout.setTouchEnabled(layout.open)
		if (!layout.open)
		{
			cu.get("Panel_1", roundItem).setBackGroundImage("res/button2_lock.png",1);
			img.setVisible(false)
		}
		else
		{
			pageView.scrollToPage(count-1)
		}

	}

	if(roundID)
	{

		var round=Data.getData("round", roundID);
		for (var i in pageView.getPages())
			if (pageView.getPages()[i].ID==roundID)
				pageView.scrollToPage(pageView.getPages()[i].index);
	}

},
Round.pageViewEvent=function (sender, type) {  
	if (type==ccui.PageView.EVENT_TURNING)
	{
		if (!sender.getPage(sender.getCurPageIndex()).open)
			return sender.scrollToPage(sender.getCurPageIndex()-1) 

			this.showRound(sender.getPage(sender.getCurPageIndex()).ID);
		cu.get( "Button_left",this.layer).setVisible(sender.getCurPageIndex()>0);
		cu.get( "Button_right",this.layer).setVisible(sender.getCurPageIndex()<sender.getPages().length-1);
	}
},

Round.showRound=function(ID)
{

	var round=Data.getData("round",ID);
	if (!round)
		return;
	var itemsArr=round.items.split(",");
	var panel=cu.get( "Panel_item",this.layer)
	panel.removeAllChildren()

	for (var i in itemsArr)
	{

		var item=Data.getData("item",itemsArr[i]);
		var itemIco= ItemIcon.create(item)
		var col=parseInt(panel.width/itemIco.width)
		itemIco.x=5+itemIco.width/2+(i%col)*(itemIco.width+5);
		itemIco.y=panel.innerHeight-itemIco.height/2-parseInt(i/col)*(itemIco.height+5);
		panel.addChild(itemIco);
	}



	cu.get("Text_power",this.layer).setString("消耗"+round.power+"体力");


	cu.get("Button_fight",this.layer).addClickEventListener(function(sender){
		Fight.create(round)
	})

	cu.get("Button_frame",this.layer).addClickEventListener(function(sender){
		Round.clearRound(ID,1)
	})
	cu.get("Button_frame10",this.layer).addClickEventListener(function(sender){
		Round.clearRound(ID,10)
	})	
}
//通关
Round.clearRound=function(ID,count)
{

	cn.send(Data.homePage+"game/clear/call",Data.userName,Data.passWD,1,ID,0,count,
			function(data){
		
		//显示扫荡结果页面
		var round=Data.getData("round", ID)
		Finished.create(1,round.name,data.money,data.exp,0,data.items.join(","));
		if (data.level>Player.data.level)
		{
			Main.playEffect("levelUp")
			cc.audioEngine.playEffect(soundRes.levelUp)
		}
		Info.getInfo();
		
		Dialog.showGetItem("money",data.money)
		Dialog.showGetItem("exp",data.exp,0.5)
		for (var i in data.items)
		{
			Dialog.showGetItem(data.items[i],1,1+i*0.5)
		}
			
	})
}
//判断关卡是否开放
Round.checkRoundOpen=function(roundID)
{
	function getPerRound(roundID)
	{
		for (var i in Data.round)
			if (Data.round[i].nextID==roundID)
				return Data.round[i];
		return null;
	}

	//如果没有前置关卡,开放
	var perRound=getPerRound(roundID);
	if (!perRound)
		return true;

	//如果前一关卡已经完成,开放
	return  Player.getRound(perRound.ID);
}
