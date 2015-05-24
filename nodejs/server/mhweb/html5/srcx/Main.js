//控制中心
function Main(){};

//显示物品信息
Main.showItem=function(item,userItem,pos)
{
	//加载UI
	if (Data.itemLayer)
	{
		Data.itemLayer.removeFromParent(true)
		Data.itemLayer=null;
		return ;
	}
	
	var width=400;
	var height=400;
	Data.itemLayer=new Item();
	Data.itemLayer.x=Math.min(cc.winSize.width-width,pos.x);
	Data.itemLayer.y=Math.max(0,pos.y-height/2);


	if (Data.itemLayer.x<0)
		Data.itemLayer.x=0;
	cu.currScene().addChild(Data.itemLayer);
	Data.itemLayer.showItem(item,userItem)
	
	//为当前场景添加点击关闭功能
	cc.eventManager.addListener(
			{
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches: true,      
				onTouchBegan:	function(touch ,event){return true},
				onTouchEnded :  function(touch ,event){

					if (Data.itemLayer)
					{
					
						Data.itemLayer.removeFromParent(true)
						Data.itemLayer=null;
					}
				}
			}, Data.itemLayer)


}





//掉落道具
Main.dropProps=function (id)
{

	var imgName=id?"res/item/"+Data.getData("item",id).img:"#res/money.png";

	var props=new cc.Sprite(imgName)	
	cu.currScene().addChild(props);
	cu.center(props);
	props.setOpacity(0)
	var fade=cc.fadeIn(0.8+Math.random())
	var action=cc.jumpTo(2, cc.p(Math.random()*cc.winSize.width,0), 100+Math.random()*200, 2);

	var finish=cc.callFunc(cu.free,props)
	props.runAction(cc.sequence(fade,action,finish)) 


	//显示金币
	if (!id)
		cc.audioEngine.playEffect(soundRes.money);

};


Main.flyHP=function(monster,data){

	var str;
	if (data.miss)
		str="m"
			else
				str=-data.hp;

	var text=new CText();
	text.setText(1,str,30);
	cc.director.getRunningScene().addChild(text)

	text.setAnchorPoint(cc.p(0.5,0.5));
	if (monster)
	{
		text.x=monster.x;				
		text.y=monster.y+30;
	}
	else
	{
		text.x=cc.winSize.width/2
		text.y=cc.winSize.height/2-200
		text.setColor(cc.color(255,0,0))
	}
	text.setScale(0.1,0.1)
	var moveAction1 = cc.moveBy(0.2, cc.p(-30, 0))
	var scaleAction=cc.scaleTo(0.2, data.crt?1.5:1, data.crt?1.5:1)
	var moveAction2 = cc.moveBy(0.7, cc.p(0, 150))

	text.runAction(cc.sequence(cc.spawn(scaleAction,moveAction1),moveAction2))
	text.free(1);
}

Main.onKeyPress=function()
{
	cc.eventManager.addListener({
		event: cc.EventListener.KEYBOARD,//事件为键盘按键  
		onKeyReleased:  function(keyCode, event){
	
			if (keyCode == cc.KEY.back) {  
				cc.director.end(); 
			} 
			else if (keyCode == cc.KEY.menu) {    //beta版本这里的menu的keycode有误，也可以自行改为15 
				
			}

		}
	}, cu.currScene());	

	//进入后台 
	cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function(){ 
		
	});
	//恢复显示 
	cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function(){ 
	
	});
}

Main.playEffect=function(name)
{

	cf.preLoad(["res/effect/"+name+".json"], function(){	
	//播放动画文件
	var layer=cu.loadScene("res/effect/"+name+".json");
	cu.currScene().addChild(layer.node)
	cu.playAnime(layer,true);
	});
}


//计算攻击扣除血量
Main.getAttackData=function(senderData,targetData)
{

	var data={};
	//判断是否闪避
	data.miss=Math.random()*100>(senderData.hit-targetData.aov)?true:false;
	if (data.miss)
		return data;
	//扣除血量
	data.hp=senderData.att+parseInt(Math.random()*(senderData.att/10));
	data.hp-=targetData.def;
	if (data.hp<=0)
		data.hp=1;
	
	//是否暴击
	data.crt=Math.random()*100<senderData.crt;
	if (data.crt)
		data.hp*=2;


	return data;
}
//计算战斗力
Main.getFightValue=function(obj)
{
	return obj.att+obj.def+obj.hp+obj.crt*10+obj.aov*10+obj.hit*10;
}
//计算装备战斗力
Main.getItemFight=function(item,userItem)
{
	
	if (userItem)
		return item.att+item.def+item.hp+item.crt*10+item.aov*10+item.hit*10+
		parseInt(item.att*userItem.level*Data.setup.strengAdd/100)+
		parseInt(item.def*userItem.level*Data.setup.strengAdd/100);
	else
		return item.att+item.def+item.hp+item.crt*10+item.aov*10+item.hit*10;
}

