//进入房间
function enterRoom(aRoomCode,loginType) {

    if (loginType==1)
    {

        var myCode="";
        myCode=$("#myCode").val();1
        if ($("#myCode").length>0)
        window.open("/room/show/" + aRoomCode, myCode);
    }
    if (loginType==2)
        window.location.href="/room/show/" + aRoomCode;
}
function loadMyInfo()
{
    postHTML("main/user/myInfo",[],function(data){
        if($("#divMyInfo").length>0)
        {
            $("#divMyInfo").hide();
            $("#divMyInfo").html(data)
            $("#divMyInfo").slideDown();
        }
        else
            window.location.reload();
    });
}
//用户登录
function login()
{


    var userCode=$("#userCode").val();
    var passWD=$("#passWD").val();


    if (!userCode)
        return $.showTip("userCode");
    if (!passWD)
        return $.showTip("passWD");

    passWD=$.md5(passWD);

    postHTML("main/login",[userCode,passWD],function(data)
    {
        if (data=='["err"]')
        {
            $.showTip("btnLogin","用户名或密码错误");
            return;
        }
        //设置登录密码,存入Cookie
        if(document.getElementById("remember").checked)
        {
            setCookie("userCode",userCode,365);
            setCookie("passWD",passWD,365);
        }
        else{
            setCookie("userCode",userCode)
            setCookie("passWD",passWD);
        }
        if($("#divMyInfo").length>0)
        {
            $("#divUnLogin").slideUp();
            $("#myCode").val(userCode)
            loadMyInfo()
            if (data)
            //加载签到面板
                CreateFlashPage('UserInfo', '/public/Flash/sign.swf?UserCode='+userCode, 420, 320, document);
        }
        $.colorbox.showHint('您已登录成功');
        if(!$("#divMyInfo").length)
            setTimeout("window.location.reload()",1000);
    })

}
//QQ登录
function QQLogin(QC)
{

    QC.Login.showPopup({
        appId:"101156031",
        redirectURI:"http://www.yucool.cn:81/views/QQLogin.html"
    });
}
//用户登出
function logOut() {
    //清空Session
    document.cookie="userCode=";
    document.cookie="passWD=";
    //显示未登录页面

    $("#divUnLogin").slideDown();
    $("#divMyInfo").slideUp();
    $.colorbox.showHint("您已经注销")
    $("#myCode").val("")

}

//用户注册
function register()
{

    var nickName=$("#nickName").val();


    var sex=$('input[name="sex"]:checked').val();
    var face=$("#userFace").attr("src");
    var passWD=$("#passWD").val();
    var conpassWD=$("#conpassWD").val();
    if (!nickName)
        return $.showTip("nickName");
    if (nickName.length<2)
        return $.showTip("nickName","不得小于2个字符");
    if (!passWD)
        return $.showTip("passWD");
    if (passWD.length<4)
        return $.showTip("passWD","不得小于4个字符");
    if (!conpassWD)
        return $.showTip("conpassWD");

    if (conpassWD!=passWD)
        return $.showTip("conpassWD","确认密码不一致");

    passWD=$.md5(passWD);

    post("main/register",[1,nickName,sex,face,passWD],function(data)
    {

        if (data.Type=="Err")
        {
            $.showTip("btnReg",data.Text);
            return;
        }
        var userCode=data[0]
        var msg=data[1]
        //注册成功
        //设置登录密码,存入Cookie
        setCookie("userCode",userCode)
        setCookie("passWD",passWD);
        $.colorbox.showHint(msg);
        //刷新我的信息
        loadMyInfo()

    })
}
//QQ注册
function QQReg(nickName,sex,face)
{

    var paras = {content : "我刚刚注册了#语酷娱乐社区#新用户。"};

    QC.api("add_t", paras)
    .success(function(s){//成功回调
        })
    .error(function(f){//失败回调
        })
    .complete(function(c){//完成请求回调
        });
    QC.Login.signOut()
    sex=sex=="男"?1:0;
    post("main/register",[2,nickName,sex,face,""],function(data)
    {



        if (data.Type=="Err")
        {
            alert(data.Text)
            flyText(data.Text);
            return;
        }
        var userCode=data[0]
        var msg=data[1]

        var passWD=$.md5(userCode.toString());
        setCookie("userCode",userCode)
        setCookie("passWD",passWD);
        $.colorbox.showHint(msg);
        //注册成功
        //刷新我的信息
        loadMyInfo()

    })
}
//增加经验
function addExp()
{
    if(!$("#myCode").val())
        return;

    post("main/addExp/get",[],function(data)
    {
        if (data.Type=="Err")
        {
            flyText(data.Text)
            return;
        }
        flyText("经验+"+data[0])
        //升级
        if(data[1])
        {
            showLevelup()
        }
    });
}
//显示升级动画
function showLevelup()
{
    var width=300;
    var height=116;
    var Left =  (GetclientWidth()-width)/2 ;
    var Top =   (GetclientHeight()-height) /2;
    var div=document.createElement("div");
    $(div).css("left",Left+"px")
    $(div).css("top",Top+"px")
    $(div).css("position","absolute")
    div.innerHTML="<img src='/public/img/LevelUp.png'/>";
    document.body.appendChild(div);
    $(div).hide()
    $(div).fadeIn(2000)
    $(div).fadeOut(1000,function(){
        $(div).remove()
    });

}
function findPWD(step)
{

    var userCode=$("#userCode").val();
    var answer=$("#answer").val();
    var passWD=$("#passWD").val();
    var conPWD=$("#conPWD").val();

    if (!userCode && step==1)
        return $.showTip("userCode");

    if (!answer && step==2)
        return $.showTip("answer","不得小于2个字符");

    if (passWD.length<4 && step==3)
        return $.showTip("passWD","不得小于4个字符");

    if (conPWD!=passWD && step==3)
        return $.showTip("conPWD","确认密码不一致");
    passWD=$.md5(passWD);
    post("main/user/findPWD",[step,userCode,answer,passWD],function(data)
    {

        if (data.Type=="Err")
        {
            $.showTip("btnNext"+step,data.Text);
            return;
        }
        if (step==3)
        {
            $.colorbox.close();
            setTimeout("$.colorbox.showHint('新密码已经设置成功,请妥善保管。')",500);
            return;
        }

        $("#step"+step).slideUp();
        $("#step"+(step-0+1)).slideDown();

        //修改成功
        if (step==1)
            $("#question").text(data[1])

    })
}
function modify()
{

    var nickName=$("#nickName").val();
    var explain=$("#explain").val();
    var sex=$('input[name="sex"]:checked').val();

    var face=$("#userFace").attr("src");
    if (!nickName)
        return $.showTip("nickName");
    if (nickName.length<2)
        return $.showTip("nickName","不得小于2个字符");

    post("main/user/modify",[nickName,explain,sex,face],function(data)
    {
        if (data.Type=="Err")
        {
            $.showTip("btnModify",data.Text);
            return;
        }

        //修改成功
        loadMyInfo();
        $.colorbox.showHint('资料修改成功。');

    })
}
function modifyPWD()
{

    var oldPWD=$("#oldPWD").val();
    var newPWD=$("#newPWD").val();
    var conPWD=$("#conPWD").val();
    if (oldPWD.length<4)
        return $.showTip("oldPWD","不得小于4个字符");
    if (newPWD.length<4)
        return $.showTip("newPWD","不得小于4个字符");
    if (conPWD!=newPWD)
        return $.showTip("conPWD","确认密码不一致");

    oldPWD=$.md5(oldPWD);
    newPWD=$.md5(newPWD);
    post("main/user/modifyPWD",[oldPWD,newPWD],function(data)
    {
        if (data.Type=="Err")
        {
            $.showTip("btnModify",data.Text);
            return;
        }

        //修改成功
        setCookie("passWD",newPWD,365);
        $.colorbox.close();
        $.colorbox.showHint('密码修改成功。');

    })
}
function modifyPayPWD()
{

    var oldPWD=$("#oldPWD").val();
    var newPWD=$("#newPWD").val();
    var conPWD=$("#conPWD").val();
    if (newPWD.length<4)
        return $.showTip("newPWD","不得小于4个字符");
    if (conPWD!=newPWD)
        return $.showTip("conPWD","确认密码不一致");
    if (oldPWD)
    oldPWD=$.md5(oldPWD);
    newPWD=$.md5(newPWD);
    post("main/user/modifyPayPWD",[oldPWD,newPWD],function(data)
    {
        if (data.Type=="Err")
        {
            $.showTip("btnModify",data.Text);
            return;
        }

        //修改成功
        $.colorbox.showHint('银行密码修改成功。');

    })
}
function modifyAQ()
{

    var answer=$("#answer").val();
    var question=$("#question").val();
    if (answer.length<4)
        return $.showTip("answer","不得小于4个字符");
    if (question.length<4)
        return $.showTip("question","不得小于4个字符");

    post("main/user/modifyAQ",[question,answer],function(data)
    {
        if (data.Type=="Err")
        {
            $.showTip("btnModify",data.Text);
            return;
        }

        //修改成功
        $.colorbox.close();
        setTimeout("$.colorbox.showHint('密保设置成功。')",500);

    })
}

function showFace()
{
    $("#divFace").load("main/face");
}
function closeFace()
{
    $("#divFace").html("");
}
function selectFace(img)
{
    $("#userFace").attr("src",img);
    closeFace();
}

function showMenu(id)
{
    $(".roomTypeMenu .subMenu").hide(200)
    if(id!=-1) {

        //  $("#Menu" + id).css({"border-bottom": "#ffaf24 2px solid"});
        $(".roomTypeMenu #subMenu" + id).fadeIn()
    }
}

function searchRoom(type,page,TypeID,menu)
{

    var searchText;
    if (type<3)//按类别搜索
        searchText=TypeID;
    if (type==3)//按条件搜索
    {
        var searchText=$("#searchText").val();
        if (!searchText || searchText=="房间号码/房间名称")
            return $.showTip("searchText","请输入搜索内容");
    }
    if (type>10)//按收藏搜索
    {
        if (!$("#myCode").val())
        {
            showLogin();
            return;
        }
        searchText=$("#myCode").val()

    }

    $("#divSearch .roomTypeMenu").each(function() {
        $(this).removeClass("selectedMenu")
    });

    $(menu).parent().parent().addClass("selectedMenu")
    $("#searchType").val(type)
    $("#searchContent").val(searchText)
    loadHTML("main/searchRoom","divRoomList",[type,page,searchText])
}

function showLogin()
{
    $.colorbox.show('/views/main/login.html')
}
function showReg()
{
    $.colorbox.show('/views/main/register.html')
}

function getHot()
{
    $("#divSearch .roomTypeMenu").each(function() {
        $(this).removeClass("selectedMenu")
    });
    $("#hot").addClass("selectedMenu")

    postHTML("main/searchRoom",[4],function(data){
        $("#searchType").val("")
        $("#divRoomList").html(data);
        postHTML("main/searchRoom",[5],function(data){
            $("#divRoomList").append(data);


        })
    })
}

function showFindPWD()
{
    $.colorbox.close();
    setTimeout("$.colorbox.show('/views/main/findPWD.html')",500);
}
function convertBank(type)
{

    var payPassWD=$("#payPassWD").val();
    var convertMoney=$("#convertMoney").val();
    if (!convertMoney)
        return $.showTip("convertMoney");
    if (payPassWD)
    payPassWD=$.md5(payPassWD);

    post("main/bank/convert",[type,convertMoney,payPassWD],function(data)
    {

        if (data.Type=="Err")
        {
            if(type==1)
            $.showTip("btnIn",data.Text);
            if(type==2)
                $.showTip("btnOut",data.Text);
            return;
        }
        //成功 刷新我的信息
        $.colorbox.showHint(data);
        loadMyInfo()

    })
}


