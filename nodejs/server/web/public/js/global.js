//创建一个透明Flash在屏幕中央显示
function CreateFlashPage(aID,aURL,aWidth,aHeight)
{
    DelPage(aID);
    aID="Page_"+aID;
    aWidth+=2;
    aHeight+=2;
    var Left =  (GetclientWidth()-parseInt(aWidth))/2 ;
    var Top =   (GetclientHeight() -parseInt(aHeight))/2;
    var Str="<div id='"+aID+"' style='width: "+aWidth+"px;	height: "+aHeight+"px;position:absolute;left:"+Left+"px;top:"+Top+"px'>";
    Str+='<object id="FlashID" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+aWidth+'" height="'+aHeight+'">';
    Str+='<param name="movie" value="'+aURL+'" />';
    Str+='<param name="quality" value="high" />';
    Str+='<param name="wmode" value="transparent" />';
    Str+='<param name="swfversion" value="17.0.0.0" />';
    Str+='<!-- 下一个对象标签用于非 IE 浏览器。所以使用 IECC 将其从 IE 隐藏。 -->';
    Str+='<!--[if !IE]>-->';
    Str+='<object type="application/x-shockwave-flash" data="'+aURL+'" width="'+aWidth+'" height="'+aHeight+'">';
    Str+='<!--<![endif]-->';
    Str+='<param name="quality" value="high" />';
    Str += '<param name="wmode" value="transparent" />';
    Str+='<param name="swfversion" value="17.0.0.0" />';
    Str+='<!-- 浏览器将以下替代内容显示给使用 Flash Player 6.0 和更低版本的用户。 -->';
    Str+='<div>';
    Str+='<h4>此页面上的内容需要较新版本的 Adobe Flash Player。</h4>';
    Str+='<p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="获取 Adobe Flash Player" width="112" height="33" /></a></p>';
    Str+='</div>';
    Str+='<!--[if !IE]>-->';
    Str+='</object>';
    Str+='<!--<![endif]-->';
    Str+='</object>';
    Str+="</div>";

    var div=document.createElement("div");//
    div.innerHTML=Str;
    document.body.appendChild(div);


}

//动态加载页面在屏幕中央
function CreatePage(aID,aURL,aWidth,aHeight,aDocument)
{

    DelPage(aID);
    aID="Page_"+aID;
    aWidth+=2;
    aHeight+=2;
    var Left =  (aDocument.body.clientWidth-parseInt(aWidth))/2 ;
    var Top =   (aDocument.body.clientHeight -parseInt(aHeight))/2;

    var Str="<div id='"+aID+"' style='width: "+aWidth+"px;	height: "+aHeight+"px;position:absolute;left:"+Left+"px;top:"+Top+"px'>";
    Str+="<iframe  marginheight=0 marginwidth=0 scrolling='no' frameborder='0'  noresize='noresize' id='"+aID+"_Frame' width='"+aWidth+"' height='"+aHeight+"'  src='"+aURL+"'></iframe>";
    Str+="</div>";
    var div=aDocument.createElement("div");//
    div.innerHTML=Str;
    aDocument.body.appendChild(div);
    return false;

}
//显示飞行文字
function flyText(text)
{

    var Left =  (GetclientWidth()-parseInt(text.length*18))/2 ;
    var Top =   (GetclientHeight() /2+100);
    var div=document.createElement("div");

    $(div).css("left",Left+"px")
    $(div).css("top",Top+"px")
    $(div).css("position","absolute")
    $(div).css("padding","5px 15px")
    $(div).css("z-index","9999")
    $(div).addClass("flyText");
    div.innerHTML=text;
    document.body.appendChild(div);
    $(div).animate({
        top:"-=100px",
        opacity:"1"
    },1000);
    $(div).animate({
        top:"-=100px",
        opacity:"0"
    },1000,function(){
        $(div).remove()
    });


}
function RepainPage(aID)
{
    var Div=document.getElementById(aID);
    var width=Div.style.width;
    var height=Div.style.height;
    var left =  (document.body.clientWidth-parseInt(width))/2 ;
    var top =   (document.body.clientHeight -parseInt(height))/2;

    Div.style.left=left;
    Div.style.top=top;
}


//删除页面
function DelPage(aID)
{
    aID="Page_"+aID;
    var Page=document.getElementById(aID);
    if (!Page)
        var Page=parent.document.getElementById(aID);
    if (!Page)
        return;

    Page.parentNode.removeChild(Page);
}
//设置Cookie
function setCookie(name,value,days)//参数为姓名、值、过期日期
{
    if (days)
    {
    var date=new Date();
    var expireDays=days;
    date.setTime(date.getTime()+expireDays*24*3600*1000);
    document.cookie=name+"="+value+";expires="+date.toGMTString();
    }
    else
        document.cookie=name+"="+value;
}
//显示确认框
function ShowConfirm(aText,aFun)
{
    var Width = arguments[2] ? arguments[2] : 200;
    var Height = arguments[3] ? arguments[3] : 80;
    var Left =  document.body.scrollLeft+(GetclientWidth()-parseInt(Width))/2 ;
    var Top =   GetScrollTop()+(GetclientHeight() -parseInt(Height))/2;
    var Str="<div style='border:10px solid #eee;background:#fff;line-height:30px;text-align:center;width: "+Width+"px;	height: "+Height+"px;position:absolute;left:"+Left+"px;top:"+Top+"px'>";
    Str+=aText;
    Str+="<br>";
    Str+="<input type='button' style='background:#ff9f24;color:#fff;width:60px' onclick='"+aFun+";ConfirmDiv.parentNode.removeChild(ConfirmDiv);' value='确认'/>";
    Str+="<input type='button' style='background:#ff9f24;color:#fff;width:60px' onclick='ConfirmDiv.parentNode.removeChild(ConfirmDiv);' value='取消'/>";
    Str+="</div>";
    var div=document.createElement("ConfirmDiv");
    div.id="ConfirmDiv";
    div.innerHTML=Str;
    document.body.appendChild(div);
    //setTimeout('CloseHint()',1000);
}
//显示提示
function showHint(aText)
{

    var Width = arguments[1] ? arguments[1] : 200;
    var Height = arguments[2] ? arguments[2] : 40;
    var Time = arguments[3] ? arguments[3] : 1000;
    var Left =  document.body.scrollLeft+(GetclientWidth()-parseInt(Width))/2 ;
    var Top =   GetScrollTop()+(GetclientHeight() -parseInt(Height))/2;
    var Str="<div id='Hint' style='z-index:99;border:10px solid #eee;background:#fff;line-height:40px;vertical-align: middle;text-align:center;width: "+Width+"px;	height: "+Height+"px;position:absolute;left:"+Left+"px;top:"+Top+"px'>";
    Str+=aText;
    Str+="</div>";
    var div=document.createElement("HintDiv");
    div.id="HintDiv";
    div.innerHTML=Str;
    document.body.appendChild(div);
    $("#HintDiv").hide()
    $("#HintDiv").fadeIn(1000)
    setTimeout('CloseHint()',Time);
}
//显示在屏幕中央
function SetCenter(aDiv)
{
    var width=$("#"+aDiv).css("width")
    var height=$("#"+aDiv).css("height")
    var Left =  GetScrollLeft()+(GetclientWidth()-parseInt(width))/2 ;
    var Top =   GetScrollTop()+(GetclientHeight()-parseInt(height))/2;
    $("#"+aDiv).css("left",Left+"px");
    $("#"+aDiv).css("top",Top+"px");

}
function closeHint()
{

    $("#HintDiv").fadeOut(1000,function() {
        $("#HintDiv").remove();
    });
}
//发送Ajax请求
function SendAjax(aURL,aParam)
{
    var ajax = false;
    //开始初始化XMLHttpRequest对象
    if(window.XMLHttpRequest) { //Mozilla 浏览器
        ajax = new XMLHttpRequest();
        if (ajax.overrideMimeType) {//设置MiME类别
            ajax.overrideMimeType("text/xml");
        }

    }

    else if (window.ActiveXObject) { // IE浏览器
        try {
            ajax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                ajax = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }
    if (!ajax) { // 异常，创建对象实例失败
        window.alert("不能创建XMLHttpRequest对象实例.");
        return "";
    }

    //通过Post方式打开连接
    ajax.open("GET", aURL, false);


    //发送POST参数
    ajax.send(aParam);


    var data = ajax.responseText;
    data=data.replace(/\r|\n/ig,"");
    return(data);
}

function SetCookie(sName, sValue){
    date = new Date();
    date.setFullYear(date.getFullYear()+1);
    document.cookie = sName + "=" + escape(sValue) + "; expires=" + date.toGMTString();
}
//获取元素坐标
function getPosX(obj){
    oRect = obj.getBoundingClientRect();
    return oRect.left+GetScrollLeft();
}
function getPosY(obj){
    oRect = obj.getBoundingClientRect();
    return oRect.top+GetScrollTop();
}
function GetScrollTop()
{
    if (document.documentElement.scrollTop==0)
        return document.body.scrollTop;
    else
        return document.documentElement.scrollTop;
}
function GetScrollLeft()
{
    if (document.documentElement.scrollLeft==0)
        return document.body.scrollLeft;
    else
        return document.documentElement.scrollLeft;
}

function GetclientWidth()
{
    if (document.documentElement.clientWidth==0 || document.documentElement.clientWidth>window.screen.Width)
        return document.body.clientWidth;
    else
        return document.documentElement.clientWidth;
}
function GetclientHeight()
{
    if (document.documentElement.clientHeight==0 || document.documentElement.clientHeight>window.screen.height)
        return document.body.clientHeight;
    else
        return document.documentElement.clientHeight;
}

//inputid为输入框的id
function numOnly(inputid) {
    //监听键盘，只允许输入数字和小数点
    $("#"+inputid).keypress(function(event) {
        var keyCode = event.which;
        if ( (keyCode >= 48 && keyCode <=57))//keyCode == 46 ||
            return true;
        else
            return false;
    }).focus(function() {
        this.style.imeMode='disabled';
    });
}

//post数据-返回JSON
function post(url,param,cb)
{

    var data={};
    if (param)
    for (var i=0;i<param.length;i++)
        data["param"+i]=param[i];
    $.post(url,data,function(data){
        var data=eval("("+data+")")
        cb(data);
    })
}
//post数据-返回html页面或字符串
function postHTML(url,param,cb)
{
    var data={};
    if (param)
    for (var i=0;i<param.length;i++)
        data["param"+i]=param[i];
    $.post(url,data,function(data){
        cb(data);
    })
}

//加载html页面
function loadHTML(url,target,param,append)
{
    if (!append)
    $("#"+target).hide();
    var data={};
    if(param)
        for (var i=0;i<param.length;i++)
            data["param"+i]=param[i];
    $.post(url,data,function(data){
        if (append)
            $("#"+target).append(data);
        else
        $("#"+target).html(data);
        $("#"+target).fadeIn();
    })

}

