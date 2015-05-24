
(function($) {
    var tab;
    $.fn.initTab=function(){
        tab=this;
        this.children("div").find("ul").find("li").each(function() {
            $(this).click(function(){
                showTab($(this))
            })
        });
        this.children(".UITabCon").find(".UITabBody").each(function(i) {
            if (i > 0)
                $(this).hide();
        });
        function showTab(menu)
        {
            tab.children("div").find("ul").find("li").each(function() {
                $(this).removeClass("cur");
            })
            $(menu).addClass("cur");
            var index=$(menu).index();
            tab.children(".UITabCon").find(".UITabBody").each(function(i) {
                if (i==index)
                {
                    $(this).fadeIn()
                }
                else
                    $(this).hide();
            })
        }
    }
})(jQuery);
