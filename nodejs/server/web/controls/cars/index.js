var mysql=require("lib/mysql")
var common=require("lib/common")
var waitTimeArr=[15,8,5];//游戏等待时间

exports.start= function () {
    setInterval(onTimer,1000)
    console.log("车行游戏服务启动完毕。")
}
function onTimer()
{

    var SQL="select CurrTime,State from Gamecars";
    mysql.query(SQL,function(err,row){

        row.CurrTime--;
        if (row.CurrTime<=0)
        {
            row.State++;
            if (row.State > 2)
                row.State = 0;
            row.CurrTime= waitTimeArr[row.State];

            //重置数据
            if(row.State==0)
            {
                ready();
            }
            if(row.State==1)
            {
                //开始比赛,创建胜利ID
                run();
            }
            if(row.State==2)
            {
                //比赛结束
                finish();

            }
        }

        mysql.exec("update GameCars set  CurrTime="+row.CurrTime+",State="+row.State);
    })
}
//准备状态,接受下注
function ready () {
    //重置数据
    mysql.exec("delete from gamecarsPet")
}

//比赛状态,创建中奖
function run()
{
    var poolMoney,petMoney,winID;
    function getPetMoney(ID,rows)
    {
        for (var i in rows)
        if (rows[i].ID==ID)
        return rows[i].petMoney*(ID+1)*2
        return 0;
    }
    //获取奖池金币
    SQL="select poolMoney from gamecars";
    mysql.query(SQL,function(err,row)
    {
        if (err)
            return
        poolMoney=row.poolMoney
        //获取下注信息
        SQL="select SUM(Money) petMoney,ID from GamecarsPet   group by ID ";
        mysql.list(SQL,function(err,rows)
        {
            if (err)
                return
            var pet=rows;

            for (var i=0;i<1000;i++)
            {
                //小于奖池数量的赔率才会产生
                var WinID = parseInt(Math.random()*8);
                if (parseInt(Math.random()*WinID)>0)
                    continue;


                var winMoney=getPetMoney(WinID,rows);
                if (winMoney <= poolMoney || winMoney==0)
                {
                    mysql.exec("update gamecars set WinID="+WinID);
                    return;
                }

            }
            //如果无法计算出赔率,采用最低赔率

            WinID= parseInt(Math.random()*2);
            mysql.exec("update gamecars set WinID="+WinID);
        });
    });

}
//结束状态,计算金币
function finish() {
    var winID,poolMoney,rate
    poolMoney=0;
    var SQL="select winID,poolMoney from gameCars"
    mysql.query(SQL,function(err,row)
    {
        winID=row.winID;

        rate=(winID+1)*2;
        SQL="select ID,UserCode,SUM(Money) Money from GameCarsPet group by UserCode,ID";
        mysql.list(SQL,function(err,rows){

            for(var i in rows)
            {
                var row=rows[i];
                if (row.ID==winID)
                {
                    var winMoney=row.Money*rate;
                    var userCode=row.UserCode;
                    poolMoney -= winMoney ;

                    //增加用户金币
                    common.getUserMoney(userCode, null, function (err, money) {

                        common.setUserMoney(userCode, money + winMoney)
                        //保存交易记录
                        //common.saveMoneyRecord(11, "车行获胜", userCode, winMoney, money + winMoney);
                        common.saveUncMoneyRecord(15, "车行获胜", userCode, winMoney, money + winMoney);
                    })
                }
                else
                {
                    poolMoney += row.Money ;
                }
            }
            //增加奖池金币
            if (poolMoney>0)
                poolMoney=parseInt(poolMoney*0.5);
            //保存数据库
            mysql.exec("update  Gamecars set PoolMoney=PoolMoney+"+poolMoney);
        })
    })


}


