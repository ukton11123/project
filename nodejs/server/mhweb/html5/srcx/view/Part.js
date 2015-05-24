
//章节选择静态类
function Part(){};
Part.layer=null;
Part.menuLayer=null;
Part.infoLayer=null;
Part.goRoundID=0;
Part.create=function (goRoundID) {
	Main.onKeyPress()
	Part.goRoundID=goRoundID;
	//加载主layer
	this.layer=cu.newScene(sceneRes.part,this.getUserRound);

	//加载信息layer
	this.layer.node.addChild(Info.create());

	//加载菜单layer
	this.layer.node.addChild(Menu.create());
	Menu.setButton("Button_part")

	
}
//获取用户关卡进度
Part.getUserRound=function()
{
	cn.send(Data.homePage+"game/round/get",Data.userName,
			function(data){
		Player.round=data;
		Part.show()
	});	
}
Part.show=function()
{

	var pageView=cu.get("PageView")
	pageView.addEventListener(this.pageViewEvent, this);
	var button=cu.get( "Button_left");
	button.setVisible(false);
	button.addClickEventListener(
			function()
			{
				pageView.scrollToPage(pageView.getCurPageIndex()-1) 
			});				
	var button=cu.get( "Button_right");
	button.addClickEventListener(
			function()
			{
				pageView.scrollToPage(pageView.getCurPageIndex()+1) 
			});		

	for(var i in Data.part)
	{
		var part=Data.part[i];
		if (part.hard>0)
		continue;
		// 组织pageview  
		var layout = cu.get("Panel_"+i)
		
		layout.ID=part.ID;
		layout.index=i;

		layout.addClickEventListener(function(sender){

			sender.getParent().scrollToPage(sender.index) 
			Round.create(sender.ID);
		})

		layout.open=Part.checkPartOpen(part.ID)
		layout.setTouchEnabled(layout.open)

		if (layout.open)
		{
			pageView.scrollToPage(i-1)
		}
		else
			layout.setColor(cc.color(55,55,55)) 
	}

	if(this.goRoundID)
	{
		var round=Data.getData("round", this.goRoundID);
		for (var i in pageView.getPages())
			if (pageView.getPages()[i].ID==round.partID)
			{
				pageView.scrollToPage(pageView.getPages()[i].index);
				//创建关卡
				Round.create(round.partID,this.goRoundID);
			}
	}

}
Part.pageViewEvent=function (sender, type) {  
	if (type==ccui.PageView.EVENT_TURNING)
	{
		if (!sender.getPage(sender.getCurPageIndex()).open)
			return sender.scrollToPage(sender.getCurPageIndex()-1) 
			cu.get( "Button_left").setVisible(sender.getCurPageIndex()>0);
		cu.get( "Button_right").setVisible(sender.getCurPageIndex()<sender.getPages().length-1);
	}
}	
//判断章节是否开放
Part.checkPartOpen=function(partID)
{

	function getPerPart(partID)
	{
		for (var i in Data.part)
			if (Data.part[i].nextID==partID)
				return Data.part[i];
		return null;
	}

	var part=Data.getData("part",partID);
	//如果用户未达到开放等级,不开放
	if (Player.data.level<part.needLevel)
		return false;
	//如果没有前置章节,开放
	var perPart=getPerPart(partID);
	if (!perPart)
		return true;

	//如果前一章节有未完成的关卡,不开放
	for (var i in Data.round)
		if (Data.round[i].partID==perPart.ID)	
			if (!Player.getRound(Data.round[i].ID))
				return false

				return true;;
}

