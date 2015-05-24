var mysql = require("lib/mysql");
exports.get=function (client) {
    global.sysSetup.day=new Date().getDate();
    global.sysSetup.month=new Date().getMonth()+1;
  client.send(global.sysSetup,global.baseItem,global.basePart,global.baseRound,global.baseMonster,
      global.baseSkill,global.baseTask,global.baseRole,global.baseDialog,global.baseItemDrop);
}
exports.getData=function(data,ID)
{

    for (var i in global[data])
            if (global[data][i].ID==ID)
                return global[data][i];
}