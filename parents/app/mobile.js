app = $.extend(app, {
    nav:{
        current_page:null,
        scroll_inf: {}
    },
    change_tab:(id)=>{
        $("#tab_indicator").css("width", $(`#tab_${id}`).outerWidth());
        $("#tab_indicator").css("left", $(`#tab_${id}`).position().left);
        $(".tab_title").addClass("tab_title_inactive");
        $(`.tab_title[page_id="${id}"]`).removeClass("tab_title_inactive");
    },
    change_page:(id)=>{
        if (!app.nav.scroll_inf[id]) app.nav.scroll_inf[id] = {};
        const cpid = app.nav.current_page;
        if (id == cpid) return;
        $('.page').hide();
        $(`#page_${id}`).fadeIn();
        $(window).scrollTop(app.nav.scroll_inf[id].last_scroll_top||0);
        app.on_page_changed(app.nav.current_page, id);
        app.nav.current_page = id;
    },
    on_page_changed:(old_id, new_id)=>{
        $("#ico_filter").toggle(new_id == "activity");
        if ($(window).scrollTop()<=80) {
            $("#dv_header").removeClass("head_shrink");
            app.nav.scroll_inf[new_id] = {};
        }
    },
    on_after_signup:()=>{
        $("#user_hours").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", ()=>{
            $("#user_hours").removeClass("ani_pulse");
        });
        $("#user_hours").addClass("ani_pulse");
    },
    changed:()=>{
        return $("#user_toolbox").is(":visible");
    },
    on_user_toolbox_enabled:(enabled)=>{
        $("#user_toolbox").toggle(enabled);
        $("#ico_up").css("bottom", $("#user_box_head_wrapper").outerHeight()+10);
        $(".page").toggleClass("footer_offset", enabled);
    },
    head_shrink:(st)=>{
        const scroll_inf = app.nav.scroll_inf[app.nav.current_page];
        if (Math.abs(st-(scroll_inf.scroll_switch||0))>80) {
            if (st > scroll_inf.last_scroll_top) $("#dv_header").addClass("head_shrink");
            if (st < scroll_inf.last_scroll_top) $("#dv_header").removeClass("head_shrink");
            scroll_inf.scroll_switch = st;
        }
        scroll_inf.last_scroll_top = st;
    },
    init_buttons:()=>{
        $("#frm_login").submit((e)=>{
            e.preventDefault(e);
            app.login();
        });
        window.onbeforeunload = function(){
            if (app.changed() && $("#dv_login").is(":hidden"))  return 'אזהרה! השינויים לא נשמרו.';
        };
        $("#bt_user_abort").click(()=>{
            app.abort();
        });
        $("#bt_user_save").click(()=>{
            app.change_page("user");
            app.save();
        });
        $("#ico_menu").click(()=>{
            $("#dv_menu_mask").show();
        });
        $("#dv_menu_mask").click(()=>{
            $("#dv_menu_mask").fadeOut();
        });
        $("#bt_user_exit").click(()=>{
            app.logout();
        });
        $("#bt_user_contact").click(()=>{
            window.open("https://wa.me/972544424749?text=הי מני, ");
        });
        $("#tab_activity, #tab_user").click((el)=>{
            const id = $(el.target).attr("page_id");
            app.change_tab(id);
            app.change_page(id);
        })
        $("#ico_filter").click((el)=>{
            $("#dv_header").hide();
            $("#user_box_head_wrapper").hide();
            $("#dv_filter_toolbox").show();
            app.change_page("filter");
        });
        $("#ico_up").click(()=>{
            $(window)[0].scrollTo({top:0, behavior: 'smooth'});
        });
        $(".filter_box_item").click((ev)=>{
            if (ev.target.tagName.toLowerCase() == "input") return;
            $(ev.target).closest(".filter_box_item").find("input").click();
        });
        // $("#filter_box_wrapper input[type='checkbox']").change(app.filter);
        $("#bt_apply_filter").click(()=>{
            $("#dv_header").show();
            $("#user_box_head_wrapper").show();
            $("#dv_filter_toolbox").hide();
            app.filter();
            app.change_page("activity");
            app.change_tab("activity");
            app.nav.scroll_inf["activuty"] = {};
            $("#dv_header").removeClass("head_shrink");
            $(window)[0].scrollTo({top:0});
        });
        $("#bt_clear_filter").click(()=>{
            $("#filter_box_wrapper input[type='checkbox']").prop("checked", false);
            $("#bt_apply_filter").click();
        });
        $(window).scroll(app.on_scroll);
    },
    on_scroll:()=>{
        const st = $(window).scrollTop();
        app.head_shrink(st);
        const ico_up_hidden = $("#ico_up").is(":hidden");
        $("#ico_up").toggle(st>200);
        if (st>200 && ico_up_hidden) $("#ico_up").css("bottom", $("#user_box_head_wrapper").outerHeight()+10);
    },
    login:(uid, on_connect_error)=>{
        app.clear();
        uid = uid || $("#eb_login").val().trim();
        if (uid == "") return;
        app.post({
            act_id: "load",
            uid: uid
        },{
            on_success :(response)=>{
                $("#dv_header").show();
                $(document).ready(()=>{
                    app.change_tab("user");
                    app.change_page("user");
                });
                app.rebuild(response);
                $("#user_box_head_wrapper").slideDown();
                $("#dv_login").fadeOut();
            }, 
            on_error_response: (error)=>{
                if (error.code == 4) {
                    app.pop_err("לא מצאנו משפחה לפי המידע שהוקלד");
                } else app.pop_srv_err(error);
            },
            on_connect_error: on_connect_error
        });
    },
    scroll_home:()=>{
        // do nothing on mobile
    },
    init: ()=>{
        $("#dv_header").hide();
        $("#dv_screen_message").hide();
        $("#user_box_head_wrapper").hide();
        $("#dv_filter_toolbox").hide();
        app.init_buttons();
        app.init_user();
        if (app.dat.user) {
            $("#dv_login").hide();
            app.login(app.dat.user.uid, ()=>{app.show_screen_message("אין תקשורת עם השרת :(")});
        } else {
            $("#dv_login").show();
        }
        $("body").show();
    },
    start_mobile: ()=>{
        if (!js.is_mobile()) {
            // app.show_screen_message("דף זה מיועד למכשירים ניידים");
            if (window.location.href.toLowerCase().indexOf("index.html")<0) window.location.href = "index.html";
        } else {
            app.init();
        }
    }
});

$(app.start_mobile)