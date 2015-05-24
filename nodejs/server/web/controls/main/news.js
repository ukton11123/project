
var MySQL=require("lib/MySQL")

exports.call=call;
function call(cb) {
    var SQL= "select ID,Title from SysNews order by ID desc limit 5 ";
    MySQL.list(SQL,function(err,rows)
    {
        if (err)
            return cb("操作失败。");
        cb(err,rows)
    })
}
exports.get=function (client) {
    call(function(err,rows)
    {
        if (err)
        return client.error(err);
       client.send(rows)
    })
}