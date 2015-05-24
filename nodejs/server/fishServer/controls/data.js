var mysql = require("lib/mysql");

exports.getData=function(data,id)
{
    for (var i in global[data])
            if (global[data][i].id==id)
                return global[data][i];
}