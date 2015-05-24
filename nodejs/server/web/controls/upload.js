var fs=require("fs");
var path=require("path");
var formidable=require('formidable');
//var gm=require('gm');
function returnScript(client,result,msg,flag)
{

    var text="<script charset=utf-8>parent.UploadCallBack("+result+",'"+msg+"',"+flag+");</script>";
    if (!result)
        text="<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />"+text;
    client.end(text);
}
function upload(client,code,cb)
{

    //var gm = require('gm')
//    ,	fs = require('fs')
//    ,	imageMagick = gm.subClass({ imageMagick : true });
//imageMagick("d:\\1.png").write("d:\\2.png",function(err){
//    console.log(err)
//});
    var typearr=['image/png','image/x-png','image/gif','image/pjpeg','image/jpeg','application/octet-stream']

    var file=client.files.userfile || client.files.file;
    if (file.size>500*1024)
    {
        fs.unlink(file.path);
        return cb(0,'上传文件尺寸过大。')
    }
    if (typearr.indexOf(file.type.toLocaleLowerCase())==-1)
    {
        fs.unlink(file.path);
        return cb(0,'上传文件类型不正确。')
    }

    var uploadPath="public/uploads/"+code+"/";
    var fileExt=path.extname(file.name);

    if (!fileExt)
        fileExt=".jpg"
    var fileName=uploadPath+parseInt(new Date().getTime())+fileExt;
    while (fs.existsSync(global.webPath+fileName))
        var fileName=uploadPath+parseInt(new Date().getTime())+fileExt;

    var fullPath=global.webPath+"/"+fileName;

    if (!fs.existsSync(global.webPath+"/"+uploadPath))
        fs.mkdirSync(global.webPath+"/"+uploadPath);
    fs.readFile(file.path,function(err,data){
        fs.writeFile(fullPath,data,function(err){
           // gm(file.path).resize(160, 160).write(fullPath,function(err){
                var Msg=fileName;
                cb(1,Msg)
                fs.unlink(file.path);
           // });

        })
    })

}
exports.uploadImg=function(client,code,flag)
{

    upload(client,code,function(result,msg){

        return returnScript(client,result,msg,flag)
    })

}
exports.uploadImgFile=function(client,code)
{
    upload(client,code,function(result,msg){

        client.end(msg);
    })

}