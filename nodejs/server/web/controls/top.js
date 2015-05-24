var topData=require("./topData")
exports.index=function(client)
{
    topData.CreateData()
    client.sysSetup=global.sysSetup;
    client.topData=global.topData;
    client.render("top")
}