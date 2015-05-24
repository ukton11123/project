
var Common=require("Lib/Common")
exports.onClose=function (client)
{
    if (client)
    Common.userQuit(client.name);
}
