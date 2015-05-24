//http网络模块静态类
function cn(){};
cn.send=function(url)
{
	var arr=[];
	for (var i = 1;i < arguments.length-1;i++)
		url+="/"+arguments[i];
	var callback=arguments[arguments.length-1];
	
var xhr = cc.loader.getXMLHttpRequest();

xhr.open("GET", url, true);
xhr.onreadystatechange = function () {
	if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {

		var json=cf.toJSON(xhr.responseText)
		if (json.Type=="Err")
			return cn.onErr(json.Text);
		callback.apply(callback,json);
		
	}
};
xhr.send();
}
//错误回调函数
cn.onErr=null;
//请求数据中函数
cn.onGeting=null;