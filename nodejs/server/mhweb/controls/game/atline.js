//增加在线时间
exports.call=function(client, userName) {

    //增加在线领奖时间
    mysql.exec("update user set usedTime=usedTime+10 where userName='" + userName + "' and ID="+taskID);

};