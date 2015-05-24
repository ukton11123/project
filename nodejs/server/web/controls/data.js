var mysql = require("lib/mysql");
exports.get=function (client,name) {
  client.send(name,global[name]);
}