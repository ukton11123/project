//对话框静态类
function Dialog(){};

//显示消息
Dialog.showMsg=function(text)
{
	//加载UI
	var layer=cu.loadScene(sceneRes.msg)
	cu.currScene().addChild(layer.node)
	var txt=cu.get("Text_content",layer)
	txt.setString(text);
	cu.playAnime(layer,true)
}
//显示获得物品
Dialog.showGetItem=function(name,value,delayTime)
{
	if (name=="money")
		cc.audioEngine.playEffect(soundRes.money)
	var sprite=new cc.Sprite();
	sprite.setAnchorPoint(cc.p(0.5,0.5));
	cu.currScene().addChild(sprite)

	if (name=="money" || name=="exp" || name=="token" ||name=="power" )
	var imgSprite=new cc.Sprite("#res/"+name+".png")
	else
	var imgSprite=ItemIcon.create(Data.getData("item", name))
	if (name=="money")
	name="金币";
	else if (name=="exp")
		name="经验";
	else if (name=="token")
		name="钻石";
	else if (name=="power")
		name="体力";
	else 
		name=Data.getData("item", name).name;
	imgSprite.setAnchorPoint(cc.p(0,0.5));
	sprite.addChild(imgSprite);
	imgSprite.x=0
	
	if (value>0)
		value="x"+value;
	var text=cc.LabelTTF.create(" "+name+" "+value,cu.fontName,24);
	text.setColor(cc.color(255,118,0))
	text.enableStroke(cc.color(55,55,55),2)
	text.setAnchorPoint(cc.p(0,0.5));
	text.x=imgSprite.width+5;
	//text.enableShadow(cc.color(0,0,0),cc.size(3,-3),0)
	sprite.addChild(text);
	sprite.cascadeOpacity=true; 
	sprite.width=text.width+5+imgSprite.width;
	cu.center(sprite)
	sprite.y-=100; 
	sprite.setOpacity(0)
	delayTime=delayTime||0;
	
	var dealy=cc.delayTime(delayTime)
	var action1=cc.fadeIn(0.3);
	var action2=cc.moveBy(0.3,cc.p(0,100))
	var action3=cc.delayTime(0.5);
	var action4=cc.moveBy(0.3,cc.p(0,100))
	var action5=cc.fadeOut(0.3);
	var finish=cc.callFunc(cu.free,sprite)
	sprite.runAction(cc.sequence(dealy,cc.spawn(action1,action2),action3,cc.spawn(action4,action5),finish)) 


}
//显示人物对话
Dialog.showDialog=function(id,left,callback)
{
	
	if (left==undefined)
		left=true
		var dialog=Data.getData("dialog", id)
		var role=Data.getData("role", dialog.roleID)
		var bg=new cc.Sprite("#res/dialog3.png");
	cu.currScene().addChild(bg);
	

	var name=cc.LabelTTF.create(role.name,cu.fontName,24);
	name.setColor(cc.color(225,0,85))
	name.x=100
	name.y=bg.height-30
	bg.addChild(name);
	
	var text=cc.LabelTTF.create("",cu.fontName,20);
	text.setColor(cc.color(0,0,0))
	text.x=bg.width/2
	text.y=bg.height/2
	bg.addChild(text);
	

	cu.addClickEventListener(bg, function(){

		if (text.getString()!=dialog.text)
		{
			text.setString(dialog.text);
			bg.unschedule(showText)
			showNextButton();
			return;
		}
		cu.free(bg)

		for (var i in Data.dialog)
			if (Data.dialog[i].preID==id)
				return Dialog.showDialog(Data.dialog[i].ID,Data.dialog[i].roleID==dialog.roleID?left:!left,callback)
		
				return callback();
	})

	var face=new cc.Sprite("res/face/"+role.face);
	face.x=left?75:430;
	face.y=bg.height+75;
	bg.addChild(face)
	var showStr="";
	var index=0;
	bg.schedule(showText, 0.1,cc.REPEAT_FOREVER)

	function showNextButton()
	{
		var next=new cc.Sprite("#res/next.png");
		next.x=bg.width-50;
		next.y=30;
		bg.addChild(next)
		var action=cc.blink(1, 1)
		next.runAction(cc.repeatForever(action))
	}

	function showText(){
		text.setString(dialog.text.substring(0,index));
		index++;
		if (index>dialog.text.length)
		{
			bg.unschedule(showText)
			showNextButton();
		}
	}
	bg.x=cc.winSize.width/2;
	bg.y=cc.winSize.height/2-300;

}