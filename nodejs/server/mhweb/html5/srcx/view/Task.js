//任务界面
function Task(){};
Task.layer=null;
Task.create=function(userTask){
		//加载UI 
	if(this.layer)
	{
		cu.free(this.layer.node)
		this.layer=null;
	}
		this.layer=cu.loadScene(sceneRes.task)
		cu.currScene().addChild(this.layer.node); 
		
		cu.get("Button_close",this.layer).addClickEventListener(
				function()
				{	
					cu.free(Task.layer.node)
					Task.layer=null;
				});
		cu.get("Button_finish",this.layer).addClickEventListener(
				function()
				{	
					Home.finishTask(this.taskID)
					cu.free(Task.layer.node)
					Task.layer=null;
				});		
		var buttonMain=cu.get("Button_main",this.layer);
		var buttonSub=cu.get("Button_sub",this.layer);
		var buttonDay=cu.get("Button_day",this.layer);
		buttonMain.setBright(false);
		buttonMain.addClickEventListener(
				function()
				{	
					Task.listTask(0)
					buttonMain.setBright(false);					
					buttonSub.setBright(true);		
					buttonDay.setBright(true);
				});
		buttonSub.addClickEventListener(
				function()
				{	
					Task.listTask(1)
					buttonMain.setBright(true);					
					buttonSub.setBright(false);		
					buttonDay.setBright(true);
				});
		buttonDay.addClickEventListener(
				function()
				{	
					Task.listTask(2)
					buttonMain.setBright(true);					
					buttonSub.setBright(true);		
					buttonDay.setBright(false);
				});		
		this.listTask(0);
		if (userTask)
			Task.showTask(userTask)
		return true;
	},
Task.listTask=function(type)
	{
		var listView=cu.get("ListView_task", this.layer)
		listView.removeAllChildren(true)
		var frist=true;
		for (var i in Player.task)
		{
			var userTask=Player.task[i];
			var task=Data.getData("task",userTask.taskID);
			if (task.type!=type)
				continue;

			var button=ccui.Button.create("res/taskButton.png","res/taskButton_down.png","res/taskButton_down.png",1);

			button.titleText=task.name;
			button.titleFontName=cu.fontName;
			button.titleFontColor =cc.color(0,0,0)
			button.x = button.width/2;
			button.y = button.height / 2;
			button.task=userTask;

			button.addClickEventListener(
					function()
					{	
						Task.showTask(this.task)
					});
			var bg = new ccui.Layout();
			bg.width=button.width;
			bg.height=button.height;
			bg.addChild(button);
			listView.pushBackCustomItem(bg);

			if(frist)
				this.showTask(userTask)
				frist=false;

		}
		cu.get("ScrollView_none", this.layer).setVisible(frist)

	},
Task.showTask=function(userTask)
	{
		if (!userTask)
			return;
		var task=Data.getData("task",userTask.taskID);
		var listView=cu.get("ListView_task", this.layer)

		for(var i in listView.getItems())
		{
			var button=listView.getItems()[i].getChildren()[0];
			button.setBright(button.task!=userTask)
			button.titleFontColor =button.task!=userTask?cc.color(0,0,0):cc.color(255,255,255)
		}
		cu.get("Button_main",this.layer).setBright(task.type!=0);
		cu.get("Button_sub",this.layer).setBright(task.type!=1);
		cu.get("Button_day",this.layer).setBright(task.type!=2);

		cu.get("Text_title", this.layer).setString(task.name);
		cu.get("Text_content", this.layer).setString(task.note);
		cu.get("text_progress", this.layer).setString(userTask.amount+"/"+task.amount)
		cu.get("Text_money", this.layer).setString(task.money);
		cu.get("Text_exp", this.layer).setString(task.exp);
		cu.get("Text_token", this.layer).setString(task.token);

		cu.get("Text_money", this.layer).setVisible(task.money)
		cu.get("Text_exp", this.layer).setVisible(task.exp)
		cu.get("Text_token", this.layer).setVisible(task.token)
		cu.get("Image_money", this.layer).setVisible(task.money)
		cu.get("Image_exp", this.layer).setVisible(task.exp)
		cu.get("Image_token", this.layer).setVisible(task.token)

		cu.get("Button_finish", this.layer).setBright(userTask.amount>=task.amount); 
		cu.get("Button_finish", this.layer).taskID=userTask.ID;

		//显示掉落
		var panel=cu.get("ScrollView_item",this.layer);
		//显示掉落物品
		var itemsArr=task.items.split(",");
		for (var i in itemsArr)
		{
			var item=Data.getData("item",itemsArr[i]);
			var itemIco=ItemIcon.create(item)
			var col=parseInt(panel.width/itemIco.width)
			itemIco.x=5+itemIco.width/2+(i%col)*(itemIco.width+5);
			itemIco.y=panel.innerHeight-itemIco.height/2-parseInt(i/col)*(itemIco.height+5);
			panel.addChild(itemIco);
		}


	}
