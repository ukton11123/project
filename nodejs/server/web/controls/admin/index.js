exports.index=function(client)
{
    client.title=global.sysSetup.SiteName+"后台管理系统";
    client.render("admin/index")
}