exports.show=function (client,flashName)
{
    //var userCode=client.getSession("userCode");
   // var passWD=client.getSession("passWD");
    //for (var i in global.dataApps)
    //if (global.dataApps[i].flashName==flashName)
    //var  Name=global.dataApps[i].Name;
    //client.sysSetup=global.sysSetup
    client.title="休闲游戏";
    client.flashName=flashName;
    client.flashParam="URL=/public/flash/"+flashName+".swf&LogoImg=/public/Img/Apps/"+flashName+"_Logo.jpg";

    client.render("game");
}