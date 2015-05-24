//Logo场景静态类
function Logo(){};
Logo.scene=null;
Logo.node=null;
Logo.create=function(){
	//加载主layer
	this.scene=new cc.Scene();
	//预加载logo和login界面
	cc.loader.load(["res/ui/logo.json","res/ui/login.json"], 
			function (result, count, loadedCount) {
	}, function(){
		Logo.node=ccs.load("res/ui/logo.json").node
		Logo.scene.addChild(Logo.node);
		Logo.scene.scheduleOnce(Logo.showLogin,0.2)
	});
	return this.scene;
},
Logo.showLogin=function(){
	cc.director.runScene(cc.TransitionFade.create(0.1,Login.create()))
}