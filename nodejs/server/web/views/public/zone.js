function checkMaxInput(obj,maxLen,chatType) {

    if (obj.innerText.length > maxLen){	//如果输入的字数超过了限制
        obj.innerText= obj.innerText.substring(0, maxLen);	//就去掉多余的字
        $("#remLen"+chatType).html('您输入的内容超出了字数限制')
    }
    else
        $("#remLen"+chatType).html('还可以输入<font size="5">'+(maxLen - obj.innerText.length)+'</font>字');

}
function SendText(chatType)//类型  1 发言  2 消息  3 回复
{

    var Text=$("#ChatContent"+chatType).html();		//内容
    if (Text=="")
    {
        $.colorbox.showHint("请输入发言内容。");
        return;
    }
    if (Text.length > 1024)
    {
        $.colorbox.showHint("输入发言内容过长。");
        return;
    }

    var targetID=$("#targetID"+chatType).val();

    $.post("/zone/create/","targetID="+targetID+"&Text="+Text+"&chatType="+chatType,function(data)
    {

        $("#ChatContent"+chatType).html("");


        if (data=="")
        {
            $.colorbox.showHint("发言失败。");
            return;
        }
        var ID=data;
        //加载刚刚的发言
        if(chatType==1)
        {
            $.post("/zone/getChatItem/"+ID,
                function(data){

                    $("#chatListDiv").prepend(data);
                    $.colorbox.showHint("发言成功。");
                    $("#ChatItem"+ID).hide();
                    $("#ChatItem"+ID).slideDown()

                });


        }

        if(chatType==2)
        {
            $.colorbox.showHint("消息发送成功。");
        }
        //回复发言,重新加载发言信息
        if(chatType==3)
        {
            $.post("/zone/getChatItem/"+targetID,
                function(data) {
                    $("#ChatItem" + targetID).html(data);
                    $.colorbox.showHint("评论成功。");
                    $("#ReplyDiv").hide();
                    $("#ChatItem" + targetID).hide()
                    $("#ChatItem" + targetID).fadeIn(500)
                });
        }
    });


}

function ShowEmote(Type)
{
    $("#EmoteDiv").remove();
    $.post("/zone/getEmote/"+Type,function(data) {
        $("body").append(data)
        SetCenter("EmoteDiv");
    });


}
function CloseEmote()
{
    $("#EmoteDiv").remove();
}
function InsertEmote(Type,Img)
{
    $("#ChatContent"+Type).append("<img src='/public/img/emote/"+Img+"'/>");
    CloseEmote();
}

function DeleteChat(ID)
{
    $.post("/zone/delete/"+ID,function(data)
    {
        $.colorbox.showHint(data);
        $("#ChatItem"+ID).remove();
    });

}
function DeleteApply(ID)
{
    $.post("/zone/delete/"+ID,function(data)
    {
        $.colorbox.showHint(data);
        $("#ApplyItem"+ID).remove();
    });
}

function Acclaim(ID)
{

    $.post("/zone/acclaim/"+ID,function(data){
        if (data==-1)
        {
            $.colorbox.showHint("已经点过赞");
            return;
        }
        $("#Acclaim"+ID).html("("+data+")");
    });


}
function ReplyChat(ID)
{

    $("#inputDiv3").remove();
    $.post("/zone/getInput/3/"+ID,function(data){
        $("#TextDiv"+ID).append(data);
    });
}

function Care(aUserCode)
{
    if (!myCode.value || myCode.value==0)
    {
        $.colorbox.showHint("请先登录再关注Ta。");
        return;
    }
    $.post("/zone/care/"+aUserCode,function(data) {
        if (data)
            $.colorbox.showHint("操作成功");
        $("#Care").text(data);
    });
}
function SendMsg(targetCode)
{
    if (!myCode.value || myCode.value==0)
    {
        $.colorbox.showHint("请先登录再发送消息。");
        return;
    }

    $("#inputDiv2").remove();
    $.post("/zone/getInput/2/"+targetCode,
        function(data) {
            $("#MsgDiv").append(data);
        });
}


function SelectSkin(ID)
{
    $.post("/zone/selectSkin/"+ID,function(data) {
        $.colorbox.showHint(data);
        setTimeout('window.location.reload()', 1000);
    });
}