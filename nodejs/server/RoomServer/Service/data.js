exports.Rank=function(ID)
{
    if (ID==null)
        return  global.dataRank
    else
        for (var i in global.dataRank)
            if (global.dataRank[i].ID==ID)
                return global.dataRank[i];
}


exports.Stamp=function(ID)
{
    if (ID==null)
        return global.dataStamp
    else
        for (var i in  global.dataStamp)
            if ( global.dataStamp[i].ID==ID)
                return  global.dataStamp[i];
}
exports.Gift=function(ID)
{
    if (!ID)
        return global.dataGift
    else
        for (var i in global.dataGift)
            if (global.dataGift[i].ID==ID)
                return global.dataGift[i];
}
