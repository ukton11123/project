var sceneRes = {
		//场景
		menu: "res/ui/menu.json",
		bag: "res/ui/bag.json",
		info: "res/ui/info.json",
		home: "res/ui/home.json",
		part : "res/ui/part.json",
		fight : "res/ui/fight.json",
		item : "res/ui/item.json",
		msg : "res/ui/msg.json",
		round : "res/ui/round.json",
		result : "res/ui/result.json",
		dialog : "res/ui/dialog.json",
		roundItem : "res/ui/roundItem.json",
		streng: "res/ui/streng.json",
		task : "res/ui/task.json",
		Finished : "res/ui/Finished.json"
};

var sceneResArr = [];
for (var i in sceneRes) {
	sceneResArr.push(sceneRes[i]);
}
var res = {
		//资源
		ui_png : "res/ui/ui.png",
		ui_plist : "res/ui/ui.plist",  
		effect_png : "res/effect/effect.png",
		effect_plist : "res/effect/effect.plist"
};    

var resArr = [];
for (var i in res) {
	resArr.push(res[i]);
}

var soundRes={
		//声音 and 字体
		battle:"res/sound/fight.mp3",
		opening:"res/sound/bgm.mp3",
		hit:"res/sound/hit.mp3",
		money:"res/sound/money.mp3",
		call:"res/sound/call.mp3",
		sword:"res/sound/sword.mp3",
		skill:"res/sound/skill.mp3",
		skill1:"res/sound/skill1.mp3",
		skill2:"res/sound/skill1.mp3",
		skill3:"res/sound/skill1.mp3",
		break3:"res/sound/break.mp3",
		win:"res/sound/win.mp3",
		lost:"res/sound/lost.mp3",
		equip:"res/sound/equip.mp3",
		levelUp:"res/sound/levelUp.mp3",
		box:"res/sound/box.mp3",
		roundStart:"res/sound/roundStart.mp3",
		streng:"res/sound/streng.mp3",
}