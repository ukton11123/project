/**
 * Created by Administrator on 2015/5/16.
 */
//游戏管理类
var func=require("lib/func")
var data=require("../data")
if(!global.tables)
global.tables=[];
//创建鱼
function createFish()
{

    var index=Math.floor(Math.random()*global.fish.length);
    if (Math.random()*100>global.fish[index].createRate)
        return createFish()
    else
        return global.fish[index];
}
//创建鱼位置
function makeFishPos(){
    var offset=Math.random()*300+300;
    var num1=Math.random();
    var num2=Math.random();
    var pos={};
    var width=global.setup.screenWidth;
    var height=global.setup.screenHeight;
    if (num1>0.5)
    {
        pos.x1=num2>0.5?-offset:width+offset;
        pos.y1=Math.random()*height;
        pos.x2=num2>0.5?width+offset:-offset;
        pos.y2=Math.random()*height;
    }
    else
    {
        pos.y1=num2>0.5?-offset:height+offset;
        pos.x1=Math.random()*width;

        pos.y2=num2>0.5?height+offset:-offset;
        pos.x2=Math.random()*width;
    }
    return pos;

}
//游戏桌
function Table() {
    this.id=0;
    this._currfishID=0;
    this.sockets=[];
    this.users=[];
    this.fishs=[];
    this.time=0;
    this.mapID=1;
    this.showFishs=false;
    this.changeWater=function()
    {
        this.time=func.time();
        this.mapID++;
        if (this.mapID>3)
            this.mapID=1;

        for (var j in this.users)
            this.sockets[j].send("onChangeWater",this.mapID);

        this.fishs=[];
        //创建鱼阵
        this.createFishs();
    },
    this.getFish=function(id)
    {
        for (var i in this.fishs)
            if (this.fishs[i].id==id)
                return this.fishs[i];
        return null;
    };
    this.getUser=function(socket)
    {
        for (var i in this.sockets)
            if (this.sockets[i]==socket)
                return this.users[i];
        return null;
    };
    this.createFishs=function()
    {
        if (global.fishs.length==0)
        return;
        this.showFishs=true;
        var width=global.setup.screenWidth;
        var height=global.setup.screenHeight;
        var index=Math.floor(Math.random()*global.fishs.length);

        var fishs=global.fishs[index];
        var fishArr=fishs.fishs.split(",");
        var count=0;
        for (var k in fishArr)
        {
        for (var i =0;i<fishs.amount;i++) {
            var fish={};
            fish.speed=100;
            fish.id=this._currfishID;
            fish.freeOnMoveOver=true;
            this._currfishID++;
            fish.createTime=func.time();
            count++;
            if (fishs.type==0)//圆形扩散鱼阵
            {

                fish.startPos={};
                fish.startPos.x=width/2;
                fish.startPos.y=height/2;
                var angle = (360/fishs.amount*i)
                fish.endPos={};
                fish.endPos.x=Math.floor(width/2+Math.sin(angle/180*Math.PI)*width);
                fish.endPos.y=Math.floor(height/2-Math.cos(angle/180*Math.PI)*width);
                fish.dealyTime=2*k;
                fish.createTime+=fish.dealyTime;
            }
            if (fishs.type==1)//双排横向鱼阵
            {
                var row=2;
                fish.startPos={};

                fish.startPos.x=-120*Math.floor((count-1)/row);
                fish.startPos.y=height/2+Math.floor((count-1)%row)*150-50;
                fish.endPos={};
                fish.endPos.x=width+300;
                fish.endPos.y=fish.startPos.y
            }
            if (fishs.type==2)//三排横向鱼阵
            {

                var row=3;
                fish.startPos={};
                fish.startPos.x=-120*Math.floor((count-1)/row);
                fish.startPos.y=height/2+Math.floor((count-1)%row)*150-100;
                fish.endPos={};
                fish.endPos.x=width+300;
                fish.endPos.y=fish.startPos.y
            }
            fish.info=data.getData("fish",fishArr[k])

            this.fishs.push(fish);

        }

        }

        for (var j in this.users)
            this.sockets[j].send("onFishs",this.fishs);
    },
    this.createFish=function(count)
    {
        for (var i =0;i<count;i++)
        {
            var fish={};
            fish.id=this._currfishID;
            this._currfishID++;
            fish.createTime=func.time();
            var pos=makeFishPos();
            fish.startPos={};
            fish.startPos.x=Math.floor(pos.x1);
            fish.startPos.y=Math.floor(pos.y1);

            fish.endPos={};
            fish.endPos.x=Math.floor(pos.x2);
            fish.endPos.y=Math.floor(pos.y2);
            //根据几率递归创建鱼
            fish.info=createFish();
            fish.speed=fish.info.speed;
            this.fishs.push(fish);
            for (var j in this.users)
                this.sockets[j].send("onFishInfo",fish);

        }



    };
    this.checkFish=function()
    {
        for (var i=this.fishs.length-1;i>=0;i--)
        {
            var fish=this.fishs[i];
            var length=func.getLength(fish.startPos,fish.endPos);
            if (func.time()-fish.createTime>length/fish.speed)
            {
                //到达屏幕边缘,重新设置位置
                if (fish.freeOnMoveOver) {
                    this.fishs.splice(i,1);
                    fish=null;
                    continue;
                }
                fish.createTime=func.time();
                var pos=makeFishPos();
                fish.dealyTime=0;
                fish.speed=fish.info.speed;
                fish.startPos.x=Math.floor(pos.x1);
                fish.startPos.y=Math.floor(pos.y1);

                fish.endPos.x=Math.floor(pos.x2);
                fish.endPos.y=Math.floor(pos.y2);
                for (var j in this.users)
                    this.sockets[j].send("onFishInfo",fish);

            }
        }
    }
}


exports.getTable=function(id)
{

    for (var i in global.tables) {
        if (global.tables[i].id == id)
            return global.tables[i];
    }
    return null;
};

exports.Table=Table;