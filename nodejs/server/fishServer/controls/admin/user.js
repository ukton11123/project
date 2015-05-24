var mysql=require("lib/mysql")
var func=require("lib/func")
exports.index=function (client)
{


    show(client)

}
exports.show=show;
function show(client)
{
    client.UserCode=0
    if(client.post)
        client.UserCode=client.post.UserCode;
    client.sysSetup=global.sysSetup;
    mysql.list("show full fields from userInfo",function(err,rows){
        client.rowsfields=rows;
        mysql.query("select *  from userInfo where userCode="+client.UserCode,function(err,row){
            if (!row && client.UserCode)
                client.msg="没有查询到此用户数据"
            client.rowData=row;
            client.dataRank=global.dataRank;
            client.dataRoomType=global.dataRoomType;
            client.dataMall=global.dataMall;
            //查询道具信息
            var SQL = "select UserProps.ID,PropsID,(BuyTime*1000+PropsLimit*Amount*24*60*60*1000) Time,Kind,Img,Name,(PropsLimit*Amount) PropsLimit,Amount from UserProps join UserInfo,DataMall " +
                "where  UserProps.PropsID=DataMall.ID and UserProps.userCode=UserInfo.userCode and UserProps.userCode="+client.UserCode;
            mysql.list(SQL,function(err,rows) {
                for (var i in rows)
                    rows[i].Time=func.timeToString(rows[i].Time);
                client.rowsProps=rows;
                client.render("admin/user")
            })
        })
    })

}
exports.modify=function(client)
{
    if (client.post.Passwd.length!=16)
    client.post.Passwd=func.MD5(client.post.Passwd);
    if (client.post.PayPassWD.length!=16 && client.post.PayPassWD.length!=0)
        client.post.PayPassWD=func.MD5(client.post.PayPassWD);
    mysql.update("userInfo",{UserCode:client.post.UserCode},client.post,function(err){
        client.msg=err?"错误:"+err.code:"修改成功";

        show(client);
    })
}
exports.insert=function(client)
{
    if (client.post.Passwd.length!=16)
        client.post.Passwd=func.MD5(client.post.Passwd);
    if (client.post.PayPassWD.length!=16 && client.post.PayPassWD.length!=0)
        client.post.PayPassWD=func.MD5(client.post.PayPassWD);
    mysql.insert("userInfo",client.post,function(err){
        client.msg=err?"错误:"+err.code:"创建成功";

        show(client);
    })
}
exports.createMutil=function(client)
{
    var startCode=client.post.UserCode;
    var endCode=client.post.endCode;
    console.log(startCode,endCode);
    for (var i=parseInt(startCode);i<=parseInt(endCode);i++)
    {

        var SQL="insert userinfo set userCode="+ i.toString()+",passWD='"+func.MD5(i.toString())+"',nickname='"+i.toString()+"',face='"+global.sysSetup.HomePage+"/public/img/face/1-1.jpg'";

       mysql.exec(SQL)
    }
    client.msg=startCode+"-"+endCode+"号段新建成功";
    show(client);
}
exports.delProps=function(client,ID,UserCode)
{
    for (var i in global.dataMall)
        if (global.dataMall[i].ID==parseInt(ID))
        {
            var Kind=global.dataMall[i].Type;
        }
    mysql.exec("delete from userprops where propsID="+ID+" and userCode="+UserCode,function(err){
        client.msg=err?"错误:"+err.code:"道具删除成功";
        client.post={};
        client.post.UserCode=UserCode;
        show(client);
        if (Kind==1)
            mysql.exec("update userinfo set usertype=0 where userCode="+UserCode);
    })

}

exports.addProps=function(client)
{


    for (var i in global.dataMall)
        if (global.dataMall[i].ID==parseInt(client.post.propsID))
        {
            var Kind=global.dataMall[i].Type;
            var Rank=global.dataMall[i].Rank;
        }
    mysql.exec("delete  from userprops  where Kind="+Kind+" and userCode="+client.post.UserCode,function(err){

        mysql.exec("insert userprops set buyTime="+func.time()+",amount="+client.post.amount+",Kind="+Kind+",userCode="+client.post.UserCode+",propsID="+client.post.propsID,function(err){
            client.msg=err?"错误:"+err.code:"道具添加成功";
            if (Kind==1)
                mysql.exec("update userinfo set usertype="+Rank+" where userCode="+client.post.UserCode);
            show(client);
        })
    });
}