
//主场景静态类
function Home(){};
Home.layer=null;
Home.taskSprite=null;//简单任务
Home.giftTask=null;//领奖任务
Home.create=function(){
	Main.onKeyPress()
	//加载主layer
	Home.taskSprite=null;//简单任务

	this.layer=cu.newScene(sceneRes.home,Home.start);
	//加载信息layer
	this.layer.node.addChild(Info.create());
	//加载菜单layer
	this.layer.node.addChild(Menu.create());
	Menu.setButton("Button_main")


};
//开始任务
Home.start=function()
{
	cu.get("Image_task",this.layer).addClickEventListener(function()
			{
		Task.create();
			});
	cu.get("Image_gift",this.layer).addClickEventListener(function()
			{
		if (Home.giftTask)
			if (Home.giftTask.amount>=Data.getData("task", Home.giftTask.taskID).amount)
				Home.finishTask(Home.giftTask.ID)
			});
	Home.getTask(); 
	Home.layer.node.schedule(Home.update,1, cc.REPEAT_FOREVER);	
}

//定时器
Home.update=function() 
{
	Home.showIcon();
	if (!Home.giftTask)
		return;
	if (Home.giftTask.amount+1>Data.getData("task", Home.giftTask.taskID).amount)
		return;
	Home.giftTask.amount++;

	if (Home.giftTask.amount%10==0)
		Home.doTask()

},

Home.doTask=function()
{

	cn.send(Data.homePage+"game/task/doTask",Data.userName,Data.passWD,
			Home.giftTask.ID,Home.giftTask.amount,null);

},
//获取任务
Home.getTask=function() 
{
	Home.giftTask=null;
	cn.send(Data.homePage+"game/task/get",Data.userName,Data.passWD,
			function(data){
		Player.task=data;
		Home.showSimpleTask();
		//领奖任务
		for (var i in data)
		{
			var userTask=Player.task[i];
			var task=Data.getData("task",userTask.taskID);
			if (task.type==3)
				Home.giftTask=userTask;
		}
	});	

},
//完成任务
Home.finishTask=function(id)
{

	cn.send(Data.homePage+"game/task/finish",Data.userName,Data.passWD,id,
			function(id,money,addExp,token,exp,level){

		if (Player.data.level<level)
		{
			Main.playEffect("levelUp");
			cc.audioEngine.playEffect(soundRes.levelUp)
		}
		var task=Data.getData("task", id)
		if (!Home.giftTask)
			TaskFinished.create(0,task.name,task.money,task.exp,task.token,task.items)
			else
				if (id!=Home.giftTask.taskID)
					TaskFinished.create(0,task.name,task.money,task.exp,task.token,task.items)

		Player.data.money+=money;
		Player.data.exp=exp;
		Player.data.level=level;
		Player.data.token+=token;
		if (money)
			Dialog.showGetItem("money",money,1)
			if (addExp)
				Dialog.showGetItem("exp",addExp,2)
				if (token)
					Dialog.showGetItem("token",token,3)

					Info.show();

		Home.getTask();
	});	 
}
Home.showIcon=function()
{
	var finishedTask=0;
	for (var i in Player.task)
	{
		var userTask=Player.task[i];
		var task=Data.getData("task",userTask.taskID);
		if (task.type<3 && userTask.amount>=task.amount)
			finishedTask++
	}
	//任务提示
	cu.get("Image_task_hint",Home.layer).setVisible(finishedTask>0)
	//在线领奖
	if(Home.giftTask)
	{
		var str;
		var giftTime=Data.getData("task", Home.giftTask.taskID).amount
		if (Home.giftTask.amount>=giftTime)
			str="点击领奖";
		else
			str=cf.toTime(giftTime-Home.giftTask.amount)
			cu.get("Text_gift",Home.layer).setString(str);
		cu.get("Image_gift_hint",Home.layer).setVisible(Home.giftTask.amount>=giftTime)
	}else
	{
		cu.get("Image_gift_hint",Home.layer).setVisible(false)
		cu.get("Text_gift",Home.layer).setString("领取完毕");
	}

}
//显示任务面板
Home.showTask=function(taskID)
{
	//加载菜单layer
	Task.create(taskID)
},
//显示任务摘要
Home.showSimpleTask=function()
{
	var taskCount=0;
	for (var i in Player.task)
		if(Data.getData("task",Player.task[i].taskID).type<3)
			taskCount++;

	var Home=this;
	if (this.taskSprite)
		cu.free(this.taskSprite)
		this.taskSprite=new cc.Sprite();
	this.layer.node.addChild(this.taskSprite);
	this.taskSprite.height=taskCount*80;
	var count=0;
	for (var i in Player.task)
	{

		var userTask=Player.task[i];
		var task=Data.getData("task",userTask.taskID);
		if(task.type>2)
			continue;
		count++;
		var bg=new cc.Sprite("#res/bar2.png");
		this.taskSprite.addChild(bg);
		bg.x=-bg.width/2;
		bg.y=(taskCount-count)*80
		bg.task=userTask;
		cu.addClickEventListener(bg, function()
				{
			Task.create(this.task);
				});


		if (task.type==0) 
			var type="[主线]";
		if (task.type==1)
			var type="[支线]";				
		if (task.type==2)
			var type="[日常]";					
		var title=cc.LabelTTF.create(type+task.name,cu.fontName,20);
		bg.addChild(title);
		title.x=bg.width/2-10
		title.y=bg.height/2

		var panel=ccui.Layout.create();
		panel.x=0
		panel.y=-40
		panel.setContentSize(cc.size(bg.width,bg.height))
		bg.addChild(panel);

		var note=ccui.Text.create(task.note+"("+userTask.amount+"/"+task.amount+")",cu.fontName,16);
		panel.addChild(note);
		note.x=bg.width/2-15
		note.y=bg.height/2
		note.setColor(cc.color(0,0,0))
		note.setTouchEnabled(false)
		var img=userTask.amount>=task.amount?"#res/finish.png":"#res/go.png";
		var go=new cc.Sprite(img)
		panel.addChild(go)
		go.x=bg.width-20;
		go.y=bg.height/2
		panel.task=task;
		panel.userTask=userTask;
		panel.setTouchEnabled(true)
		panel.addClickEventListener(
				function()
				{
					//关卡任务
					if (this.task.kind==0)
					{
						if(this.userTask.amount>=this.task.amount)
							Home.finishTask(this.userTask.ID)
							else
							{
								Part.create(this.task.target)
							}
					}

				});
		var action=cc.moveBy(1, cc.p(bg.width,0))
		var delay=cc.delayTime(0.3*i)
		bg.runAction(cc.sequence(delay,action))

	} 
	this.taskSprite.x=this.taskSprite.width/2;
	this.taskSprite.y=cc.winSize.height/2;


}




