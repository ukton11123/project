
exports.on = function (client, nickName,level,text) {

    client.broadcast(nickName,level,text);


}