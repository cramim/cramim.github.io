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
    on_after_signup:(is_private)=>{
        $("#user_hours").one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", ()=>{
            $("#user_hours").removeClass("ani_pulse");
        });
        $("#user_hours").addClass("ani_pulse");
        const nag_status = window.localStorage.getObj('cramim-parents-help_message-nag_status') || {};
        app.help_message.show_signup();
        if (nag_status?.signup && is_private) swal({
            title: 'אחלה :)',
            html: 'הרעיון התווסף לרשימה בלשונית "הרשימה שלנו"',
            showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'סגור',
        })
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
            app.change_tab("user");
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
            window.open("https://chat.whatsapp.com/Bq5DjkU7uBL9ntJuuDcuCp");
        });
        $("#bt_user_feedback").click(()=>{
            window.open("https://forms.gle/GsKDPFPszqFMJjsHA");
        });
        $("#bt_change_campaign").click(()=>{
            $("#dv_campaign_menu_mask").show();
        });
        $("#dv_campaign_menu_mask").click(()=>{
            $("#dv_campaign_menu_mask").fadeOut();
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
            $("#ico_filter").toggleClass("filter_is_on", $(".filter_box_item input[type='checkbox']:checked").length>0);
            app.nav.scroll_inf["activuty"] = {};
            $("#dv_header").removeClass("head_shrink");
            $(window)[0].scrollTo({top:0});
        });
        $("#bt_clear_filter").click(()=>{
            $("#filter_box_wrapper input[type='checkbox']").prop("checked", false);
            app.set_filter_button_mode();
            $("#bt_apply_filter").click();
        });
        $(window).scroll(app.on_scroll);
        $(window).on("orientationchange", event => {
            setTimeout(()=>{app.change_tab(app.nav.current_page)}, 100);
        });
        /* disabled sep 1 2022
        $("#login_register_link").click(()=>{
            app.set_login_mode((app.dat.login_mode == "LOGIN")?"REGISTER":"LOGIN");
        });
        */
    },
    set_filter_button_mode: ()=> $("#ico_filter").toggleClass("filter_is_on", $(".filter_box_item input[type='checkbox']:checked").length>0),
    on_after_rebuild: ()=> app.set_filter_button_mode(),
    on_scroll:()=>{
        const st = $(window).scrollTop();
        app.head_shrink(st);
        const ico_up_hidden = $("#ico_up").is(":hidden");
        $("#ico_up").toggle(st>200);
        if (st>200 && ico_up_hidden) $("#ico_up").css("bottom", $("#user_box_head_wrapper").outerHeight()+10);
    },
    help_message_txt:{
        welcome: 
            '<div id="help_welcome">' + 
                '<div class="help_paragraph">ברוכים הבאים לממשק ההרשמה למעורבות ההורים בכרמים. מוזמנים להירשם לפעילויות בהן תרצו להשתלב. שימו לב, ההרשמה הינה לשנת תשפ"ה והיא משפחתית.</div>' +
                '<div class="help_paragraph">תחת הלשונית השמאלית: <span class="help_tab">"הוספת פעילויות"</span>, מצאו פעילויות ולחצו על הכפתור "הצטרפ/י".<br>הפעילויות אליהן הצטרפתם נאספות ומופיעות תחת הלשונית הימנית: <span class="help_tab">"הרשימה שלנו"</span>.</div>' +
                '<div class="help_paragraph">העזרו באפשרויות הסינון בלחיצה על צלמית זכוכית המגדלת <img class="help_filter_ico" src="img/search.png"> כדי למצוא פעילויות לרוחכם.</div>' +
                '<div class="help_nagging"><input id="cb_help_welcome_nagging" type="checkbox" checked="true" /><label for="cb_help_welcome_nagging">הבנתי, אין צורך להציג הודעה זו שוב.</label></div>' +
            '</div>',
        signup:'<div id="help_signup">' + 
            '<div class="help_paragraph">המשיכו לחפש ולהצטרף לפעילויות נוספות, עד שתמלאו את מכסת השעות שלכם (מותר לעבור אותה) ולסיום לחצו "שמירה" בכפתור הירוק שלמטה.</div>' +
                '<div class="help_paragraph">בכל שלב (גם לאחר השמירה) ניתן להסיר ההצטרפות ע"י לחיצה על צלמית הפח, המופיעה בצד כל פעילות תחת הלשונית <span class="help_tab">"הרשימה שלנו"</span>.</div>' + 
                '<div class="help_nagging"><input id="cb_help_signup_nagging" type="checkbox" checked="true" /><label for="cb_help_signup_nagging">הבנתי, אין צורך להציג הודעה זו שוב.</label></div>' +
            '</div'
    },
    change_campaign:(id)=>{
        window.location.href = "mobile.html?campaign=" + id;
    },
    login:(uid, on_connect_error, on_user_not_found)=>{
        $(".dv_login_error_msg").hide();
        app.clear();
        uid = uid || $("#eb_login").val().trim();
        var post_data = {
            act_id: "load",
            uid: uid,
            register_user: app.dat.login_mode == "REGISTER",
            campaign_id: app.dat.campaign_id
        };
        if (app.dat.login_mode == "REGISTER") {
            const register_family_name = $("#eb_register_family_name").val().trim();
            const valid_email = js.is_valid_email(uid);
            const valid_phone = js.is_valid_phone(uid);
            if (!valid_email && !valid_phone) $("#dv_login_uid_error_msg").show();
            const valid_name = register_family_name != '';
            if (!valid_name) $("#dv_login_name_error_msg").show();
            if (!(valid_email || valid_phone) || !valid_name) return;
            if (valid_email) post_data.register_email = uid;
            if (valid_phone) post_data.register_phone = uid;
            post_data.register_family_name = register_family_name;
        }
        if (uid == "") return;
        app.post(post_data,{
            on_success :(response)=>{
                $("#dv_header").show();
                $(document).ready(()=>{
                    app.change_tab("user");
                    app.change_page("user");
                });
                app.rebuild(response);
                $("#user_box_head_wrapper").slideDown();
                $("#dv_login").fadeOut();
                app.help_message.show_welcome();
            }, 
            on_error_response: (error)=>{
                if (error.code == 4) {
                    app.pop_err("לא מצאנו משפחה לפי המידע שהוקלד");
                    if (on_user_not_found) on_user_not_found();
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
        app.init_campaign();
        app.init_buttons();
        app.init_user();
        if (app.dat.user) {
            $("#dv_login").hide();
            app.login(app.dat.user.uid, ()=>{app.show_screen_message("אין תקשורת עם השרת :(")}, ()=>{$("#dv_login").fadeIn();});
        } else {
            $("#dv_login").show();
        }
        $("body").show();
    },
    start_mobile: ()=>{
        if (!js.is_mobile()) {
            // app.show_screen_message("דף זה מיועד למכשירים ניידים");
            if (window.location.href.toLowerCase().indexOf("index.html")<0) {
                const query = window.location.href.split('?')[1]||'';
                window.location.href = "index.html" + ((query == '') ? '' : "?" + query);
            }
        } else {
            app.init();
        }
    }
});

$(app.start_mobile)