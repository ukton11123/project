//通用函数库静态类
function cf(){};
//JSON格式转换
cf.toJSON=function (text)
{
	return JSON.parse(text);
}
//JSON格式转换
cf.fromJSON=function (obj)
{
	return JSON.stringify(obj);
}
//自动更新
cf.update=function(callback)
{
	var failCount = 0; 
	var maxFailCount = 3;   //最大错误重试次数

	var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
	var assetManager = new jsb.AssetsManager("res/project.manifest", storagePath); 
	assetManager.retain();
	if (!assetManager.getLocalManifest().isLoaded()) 
		return callback("更新资源失败");

	var listener = new jsb.EventListenerAssetsManager(assetManager, function(event) { 
		switch (event.getEventCode()){ 
		case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST: 
			return callback("没有查找到本地资源信息");
			break; 
		case jsb.EventAssetsManager.UPDATE_PROGRESSION: 
			callback(null,event.getPercent())
			cc.log(event.getMessage());
			break; 
		case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST: 
		case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST: 
			return callback("下载更新文件失败");
			break; 
		case jsb.EventAssetsManager.ALREADY_UP_TO_DATE: 
			return callback("已经是最新版本");
			break; 
		case jsb.EventAssetsManager.UPDATE_FINISHED: 
			cc.log("更新完成"); 
			return callback("更新完成");
			break; 
		case jsb.EventAssetsManager.UPDATE_FAILED: 
			failCount++; 
			if (failCount < maxFailCount) 
			{ 
				callback("更新失败,正在重新尝试更新")
				assetManager.downloadFailedAssets(); 
			} 
			else 
			{ 
				failCount = 0; 
				return callback("尝试重新更新失败,请重新下载安装文件")
			} 
			break; 
		case jsb.EventAssetsManager.ERROR_UPDATING: 
			return callback("下载更新文件失败");
			break; 
		case jsb.EventAssetsManager.ERROR_DECOMPRESS: 
			return callback("下载更新文件失败");
			break; 
		default: 
			break; 
		} 
		

	})

	cc.eventManager.addListener(listener, 1); 
	assetManager.update(); 
}
//根据两点获取角度
cf.getAngle=function(pos1,pos2)
{
	return -180 / Math.PI * Math.atan2((pos2.y - pos1.y) , (pos2.x - pos1.x))
}
//根据两点获取长度
cf.getLength=function(pos1,pos2)
{
	return Math.sqrt(Math.pow((pos2.y - pos1.y), 2) +Math.pow((pos2.x - pos1.x), 2))
}
//对象比较
cf.is=function(obj,objClass)
{
	return	obj instanceof  objClass
}


cf.getValue=function(value)
{
	return Math.random()*100<value;
}
//动态预加载资源
cf.preLoad=function(name,onFinish,onProgress)
{  

	cc.loader.load(name, 
			function (result, count, loadedCount) {
		var percent = (loadedCount / count * 100) | 0;
		percent = Math.min(percent, 100);
		if (onProgress)
			onProgress(percent);
	}, function(){
		if (onFinish)
			onFinish();
	});
}
//时间转换
cf.toTime=function(s)
{
	return parseInt(s/60)+":"+s % 60;
}

