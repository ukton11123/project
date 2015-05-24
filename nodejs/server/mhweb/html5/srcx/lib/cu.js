//图形函数库静态类
function cu(){};
//播放场景动画
cu.playAnime=function (layer,autoFree,loop,start,end,callback)
{
	loop=loop||false;

	layer.action.retain()
	layer.node.stopAction(layer.action); 
	layer.node.runAction(layer.action);
	if (start)
		layer.action.gotoFrameAndPlay(start,end,loop);
	else
		layer.action.gotoFrameAndPlay(0,loop);
	if (autoFree)
		layer.action.setFrameEventCallFunc(function(data){
			layer.node.removeFromParent(true)
		})
		if (callback)
			layer.action.setLastFrameCallFunc(callback)

}
//创建场景
cu.newScene=function(file,onEnter,fade)
{
	var scene=new cc.Scene();
	var layer;
	if (file)
		layer=cu.loadScene(file);
	else
		layer=new cc.Layer();
	scene.addChild(layer.node);
	scene.layer=layer;
	if (onEnter)
		scene.onEnterTransitionDidFinish=onEnter;
	if (fade)
		cc.director.runScene(cc.TransitionFade.create(1,scene))
		else
			cc.director.runScene(scene)
			return layer;
}

//获取当前场景
cu.currScene=function()
{
	return cc.director.getRunningScene();
}

cu.fontName="黑体";

cu.loadScene=function(file)
{
	var progressImg=[];
	var progressArr=[];
	function setFont(parent)
	{
		for(var i in parent.getChildren())
		{
			var obj=parent.getChildren()[i];
			if (cf.is(obj,ccui.Text))
			{
				obj.setFontName(cu.fontName);
				obj.setLocalZOrder(1)
			}
			if (cf.is(obj,ccui.Button))
				obj.titleFontName=cu.fontName;	

			if (cf.is(obj,ccui.LoadingBar))
			{
				var progress=new CProgress();
				progress.x=obj.x;
				progress.y=obj.y;
				progress.setImg(progressImg[obj.tag])
				progress.setSize(obj.width, obj.height)
				parent.addChild(progress)
				progress.name=obj.name;
				progress.setLocalZOrder(0)
				progress.setPercent(obj.getPercent())
				progressArr.push(obj);

			}
			setFont(obj)
		}
	}
	var json = cc.loader.getRes(file);

	getObj(json.Content.Content.ObjectData)
	function getObj(parent)
	{
		for (var i in parent.Children)
		{
			var obj=parent.Children[i];
			if (obj.ctype=="LoadingBarObjectData")
				progressImg[obj.Tag]=obj.ImageFileData.Path;

			getObj(obj)
		}
	}
	var layer=ccs.load(file);
	setFont(layer.node)
	for(var i in progressArr)
		progressArr[i].removeFromParent(true)
		layer.action.retain()//如果场景中带有帧动画,必须在加载时retain才可在后续过程中播放动画
		layer.node.runAction(layer.action);
	layer.x=cc.winSize.width/2;
	layer.y=cc.winSize.height/2;
	//cu.get("Text_nickName",layer).setFontName("黑体");
	return layer
}


//获取场景控件
cu.get=function (name,layer)
{
	if (!layer)
		layer=cu.currScene().layer;

	return ccui.helper.seekWidgetByName(layer.node, name); 
}
//释放对象
cu.free=function(target,fadeTime){
	if (!fadeTime)
		target.removeFromParent(true)
		else
		{
			var action = cc.fadeOut(fadeTime)
			var finish=cc.callFunc(cu.free,target)
			target.runAction(cc.sequence(action,finish))
		}

}
//居中
cu.center=function(node)
{
	//node.setAnchorPoint(cc.p(0.5,0.5));
	if (!node.getParent())
	{
		node.x=node.width/2;
		node.y=node.height/2
	}
	else{
		if (cf.is(node.getParent(),cc.Scene))
			node.attr({
				x: cc.winSize.width/2,
				y: cc.winSize.height/2
			});

		else
			node.attr({
				x: node.getParent().width/2,
				y: node.getParent().height/2
			});
	}
}
//碰撞检测 点
cu.hitTest=function(node,pos)
{
	if (!node.getParent())
		return false;						
	var w=node.width;
	var h=node.height;
	var p=node.getParent().convertToWorldSpace(cc.p(node.x,node.y))
	return cc.rectContainsPoint(cc.rect(p.x-w/2,p.y-h/2,w,h), pos);
}

//设置尺寸
cu.setSize=function(node,w,h)
{
	node.setScale(w/node.width,h/node.height)
}
//碰撞检测 对象
cu.hitTestObj=function(node1,node2)
{
	var aRect = node1.getBoundingBox();
	var bRect = node2.getBoundingBox();
	return cc.rectIntersectsRect(aRect, bRect);
},
//改变图片
cu.setImg=function(sprite,img,fromPlist)
{
	//this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(img))

	if (!img)
		return
		if (fromPlist)
			sprite.setSpriteFrame(img)
			else
				sprite.setTexture(img)
},
//设置父类
cu.setParent=function(sprite,parent)
{
	sprite.removeFromParent(false)
	sprite.retain()
	parent.addChild(sprite);
	cu.center(sprite);
}
//获取触摸位置
cu.getTouchPos=function(node)
{
	return node.beginPos
}
//添加触摸事件
cu.addClickEventListener=function(node,clickFunc,longClickFunc,swallow)
{
	if (swallow==undefined)
		swallow=true;
	cc.eventManager.addListener(
			{
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: swallow,              
				onTouchBegan:	function(touch ,event){

					node.beginPos=touch.getLocation();
					//长按事件
					if ( cu.hitTest(node,touch.getLocation()))
						if (longClickFunc)
							node.scheduleOnce(longClickFunc,0.5)
							return cu.hitTest(node,touch.getLocation());
				},
				onTouchEnded :  //触摸结束
					function(touch ,event){
					if (cf.getLength(touch.getLocation(),node.beginPos)>50)
						return;
					if ( cu.hitTest(node,touch.getLocation()))
					{
						if (clickFunc)
							clickFunc(node,touch.getLocation());
						if (longClickFunc)
							node.unschedule(longClickFunc)
					}
					return cu.hitTest(node,touch.getLocation());
				}
			}, node)

}

cu.loadMap=function(path,file,callBack)
{
	_userData={};
	//预加载场景文件
	cf.preLoad([path+file], function(){

		var json = cc.loader.getRes(path+file);
		//计算骨骼动画数量
		var count=0;
		for (var i in json.Content.Content.ObjectData.Children)
		{
			var obj=json.Content.Content.ObjectData.Children[i];
			if (obj.UserData)
			{

				_userData[obj.Tag]=obj.UserData;
			}
			if (obj.ctype=="ArmatureNodeObjectData")
				count++;
		}
		if (count==0)
			return bindData();
		function bindData()
		{
			//加载场景文件
			var layer=cu.loadScene(path+file);
			for (var i in layer.node.getChildren())
			{
				var obj=layer.node.getChildren()[i];
				//绑定用户数据
				if (_userData[obj.tag]) 
				{
					obj.userData=cf.toJSON(_userData[obj.tag]);
					obj.kind=obj.userData.kind;
				}
			}

			if(callBack)
				callBack(layer)
		}
		//预加载骨骼动画
		for (var i in json.Content.Content.ObjectData.Children)
		{
			var obj=json.Content.Content.ObjectData.Children[i];
			if (obj.ctype=="ArmatureNodeObjectData")
			{
				cf.preLoad([
				            path+obj.FileData.Path,
				            path+obj.FileData.Path.substring(0,obj.FileData.Path.length-11)+"0.plist",
				            path+obj.FileData.Path.substring(0,obj.FileData.Path.length-11)+"0.png",
				            ], function(){

					count--;
					if (count==0)
						bindData()
				});
			}

		}

	});
}

//获取用户数据
cu.getUserData=function(node)
{
	return node.getUserObject().getCustomProperty()

}
//添加动画帧  图片名称可匹配
cu.addMovie=function(sprite,img,action)
{
	action=action||"default";
	if (!sprite.animateArr)
		sprite.animateArr={};
	if (!sprite.animateArr[action])
		sprite.animateArr[action]=new Array();
	for (var name in cc.spriteFrameCache._spriteFrames)
		if (img==name.substring(0, img.length))
			sprite.animateArr[action].push(cc.spriteFrameCache._spriteFrames[name]);



}
//播放动画
cu.playMovie=function(sprite,callback,time,loop,action)
{
	time=time||0.25;
	action=action||"default";
	if (loop==undefined)
		loop=false;

	if (!sprite.animateArr)
		return;	

	if (!sprite.animateArr[action])
		return;
	cu.stopMovie(sprite);

	var animate=new cc.Animation(sprite.animateArr[action],time);
	var actions=cc.animate(animate);
	if(loop)
		actions=cc.repeatForever(actactionsion)
	if(callback)
		actions=cc.sequence(actions,cc.callFunc(callback,sprite))
	sprite.animateAction =sprite.runAction(actions)
}
//停止播放动画
cu.stopMovie=function(sprite)
{
	if (sprite.animateAction)
		sprite.stopAction(sprite.animateAction);
	sprite.animateAction=null;
}
//创建受击效果
cu.beAttack=function(sprite)
{
	var action1=cc.moveBy(0.1,cc.p(5,0))
	var action2=cc.tintTo(0.1, 100, 0, 0)
	var action3=cc.moveBy(0.1,cc.p(-5,0))
	var action4=cc.tintTo(0.1, 255, 255, 255)

	sprite.runAction(cc.sequence(cc.spawn(action1,action2),cc.spawn(action3,action4)))
	
	var obj=new cc.Sprite("#res/obj.png");
	sprite.getParent().addChild(obj)

	obj.x=sprite.x+(Math.random()*sprite.width/2)*(Math.random()>0.5?1:-1);
	obj.y=sprite.y+(Math.random()*sprite.height/2)*(Math.random()>0.5?1:-1);
	
	var num=(obj.x>sprite.x)?1:-1;
	var time=0.2+Math.random();
	var x=obj.x+Math.random()*100*num;
	var action5=cc.jumpTo(time,cc.p(x, sprite.y-sprite.height/2), Math.random()*100, 1)
	var action6=cc.fadeOut(0.3)
	var angle=Math.random()*360;
	var action7=cc.rotateBy(time,angle,angle)
	var finish=cc.callFunc(cu.free,obj)
	obj.runAction(cc.sequence(cc.spawn(action5,action7),action6,finish)) 
}