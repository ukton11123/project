

//Logo场景静态类
function Login(){};
Login.scene=null;
Login.node=null;
Login.create=function(){
	//加载UI
	this.scene=new cc.Scene()
	this.node=ccs.load("res/ui/login.json").node;
	this.scene.addChild(this.node);
	this.scene.scheduleOnce(this.update, 0.5)
	return this.scene;
}
Login.update=function(){ 

	if (!cc.sys.isNative) 
	{ 
		Login.initGame(); 
		return; 
	}
	cf.update(function(info,persent){
		if (info)
		{
			cc.log(info);
			Login.initGame(); 
		}else
			cc.log("资源更新中:"+persent)
	})
}
//用户登录
Login.login=function()
{
	cn.send(Data.homePage+"game/user/login",Data.userName,Data.passWD,
			function(data){
		Player.data=data;
		Login.getData();

	});	
}
//获取基础数据
Login.getData=function()
{
	cn.send(Data.homePage+"data/get",function(setup,item,part,round,monster,skill,task,role,dialog){
		Data.setup=setup;
		Data.item=item;		
		Data.monster=monster;
		Data.part=part;		
		Data.round=round;		
		Data.skill=skill;
		Data.task=task;
		Data.dialog=dialog;
		Data.role=role;
		cn.onErr=Dialog.showMsg;
		Home.create();
	});	
}
Login.initGame=function(){ 
	cc.loader.loadJs(["src/jsList.js"], function(){ 
		cc.loader.loadJs(jsList, function(){ 
			Main.onKeyPress()
			//预加载图片资源
			cf.preLoad(resArr, function(){
				cc.spriteFrameCache.addSpriteFrames(res.ui_plist);
				cc.spriteFrameCache.addSpriteFrames(res.effect_plist);

				//预加载场景资源
				cf.preLoad(sceneResArr, function(){
					//播放背景音乐
					//cc.audioEngine.playMusic(soundRes.opening,true)
					Login.login();
				},function(present){
					//cc.log("加载场景资源"+present);
				})
			},function(present){
				//cc.log("加载图片资源"+present);
			})
		});  
	}); 
}