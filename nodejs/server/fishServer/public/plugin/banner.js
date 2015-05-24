//广告轮播插件
(function($) {
    var count=0
    var currIndex=0;
    var banner;
    $.fn.banner=function(time)
    {
        banner=this;
        showBanner();
        setInterval(showBanner,time);
    }
    function showBanner()
    {
        count=0;
        banner.children("div").each(function(i) {
            count++;
            if (i==currIndex) {
                    $(this).slideDown();
            }
            else {
                $(this).slideUp();
            }

        });

        currIndex++;
        if (currIndex>=count)
            currIndex=0
    }
})(jQuery);