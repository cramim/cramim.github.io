app = $.extend(app, {
    current_page:null,
    change_tab:(id)=>{
        $("#tab_indicator").css("width", $(`#tab_${id}`).outerWidth());
        $("#tab_indicator").css("left", $(`#tab_${id}`).position().left);
        $(".tab_title").addClass("tab_title_inactive");
        $(`.tab_title[page_id="${id}"]`).removeClass("tab_title_inactive");
    },
    change_page:(id)=>{
        if (id == app.current_page) return;
        $('.page').hide();
        $(`#page_${id}`).fadeIn();
        app.current_page = id;
    },
    init_buttons:()=>{
        $("#tab_activity, #tab_user").click((el)=>{
            const id = $(el.target).attr("page_id");
            app.change_tab(id);
            app.change_page(id);
        })
        $("#ico_filter").click((el)=>{
            app.change_tab("activity");
            app.change_page("filter");
        })
        $("#ico_up").click(()=>{
            $(window)[0].scrollTo({top:0, behavior: 'smooth'});
        });
        $(window).scroll(()=>{
            const st = $(window).scrollTop();
            if (Math.abs(st-(window.scroll_switch||0))>80) {
                if (st > window.last_scroll_top) $("#dv_header").addClass("head_shrink");
                if (st < window.last_scroll_top) $("#dv_header").removeClass("head_shrink");
                window.scroll_switch = st;
            }
            window.last_scroll_top = st;
            $("#ico_up").toggle(st>200);
        })
        $(document).ready(()=>{
            app.change_tab("user");
            app.change_page("user");
        });
    }
});