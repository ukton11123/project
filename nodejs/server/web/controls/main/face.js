exports.index=function(client)
{
    client.dataFace=global.dataFace;
    client.render("/main/face");
}