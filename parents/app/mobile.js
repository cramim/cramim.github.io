app = $.extend(app, {
    init_buttons:()=>{
        $("#ico_profile").click(()=>{
            $("#ico_activity").removeClass("ico_head_active");
            $("#ico_profile").addClass("ico_head_active");
        })
        $("#ico_activity").click(()=>{
            $("#ico_profile").removeClass("ico_head_active");
            $("#ico_activity").addClass("ico_head_active");
        })
        $("#tab_activity, #tab_user").click((el)=>{
            $("#tab_indicator").css("width", $(el.target).outerWidth());
            $("#tab_indicator").css("left", $(el.target).position().left);
        });
    }
});