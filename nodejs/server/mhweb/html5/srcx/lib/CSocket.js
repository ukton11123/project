
//websocket类
CSocket=function(url){
			var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket; 

			this.webSocket = new WebSocket(url);
			this.webSocket.onopen = function(evt) {
				cc.log("webSocket已连接.");
			};

			this.webSocket.onmessage = function(evt) {

				var textStr = "response text msg: "+evt.data;
				cc.log(textStr);

			};

			this.webSocket.onerror = function(evt) {
				cc.log("sendText Error was fired");
			};

			this.webSocket.onclose = function(evt) {
				cc.log("webSocket websocket instance closed.");
			};
			this.send=function(text)
			{
				this.webSocket.send(text);
			}		
			this.close=function()
			{
				this.webSocket.close();
			}		
};
