Storage.prototype.setObj = function(key, value) {this.setItem(key, JSON.stringify(value));}
Storage.prototype.getObj = function(key) {var value = this.getItem(key); return value && JSON.parse(value); }

var js = {
    repeat:(s, n)=>{return Array(n+1).join(s);},
    zeros:(n)=>{return js.repeat("0", n)},
    pad_zero:(s, len)=>{var zs = js.zeros(len) + s; return zs.substr(zs.length - len);},
    escapeRegExp: (s)=> {return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');},
    r : (str, s1, s2)=>{return (str+'').replace(new RegExp(js.escapeRegExp(s1),"gi"), s2);},
    is_mobile: ()=>{
        var is_mobile = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) is_mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return is_mobile;
    },
    urlParam:name=>{
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (!results) return null;
        return decodeURI(results[1]) || 0;
    }}

var app = {
    dat:{
        srv_url: 'https://script.google.com/macros/s/AKfycbw9iVdg5gGV0OzF_KOMDVjFZkL-HrIMd9vjiF7vsO-1dNcs0eRx_L5-g9D4rMEMGDjMTQ/exec',
        server_load_response: null,
        user:null,
        activity_list:[],
        signup_list:[],
        user_goal:0,
        initial_signup_list:[],
        mandatory_activity_list:[],
        mode:null,
        idx:{
            activity_list:{},
            activity_groups:{},
            group_by_activity:{}
        }
    },
    is_mobile: false,
    please_wait:(visible)=>{
        $('#mask_div').toggle(Boolean(visible));
        $('#mask_div').off("click").on("click", ()=>{$('#mask_div').animate({opacity:1},10,()=>{$('#mask_div').animate({opacity:0.5},500)})});
    },
    pop_err:(msg, is_html)=>{
        swal($.extend({type:"error", title:"בעיה :(", confirmButtonText: "סגור"}, (is_html)?{html:msg}:{text:msg}));
        if (!is_html) console.log(msg);
    },
    pop_success:(msg, timer)=>{
        swal({type:'success',html:msg||'הצליח :)', timer:timer});
    },
    pop_js_err:(err)=>{
        var s_stack = String(err.stack);
        s_stack = js.r(s_stack, "\n", "<br>");
        var mail = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent("An error has occurred at " + new Date() + "\n" + err.stack)}&to=cramim.community@gmail.com`;
        app.pop_err(`תקלה בביצוע הפעולה<div class="error_code">${s_stack}}<div><a href="${mail}" target="_blank">Send</a></div></div>`, true);
    },
    pop_srv_err:(srv_err)=>{
        const msg = `message from server:\ncode: ${srv_err.code}\nmessage: ${srv_err.desc}`;
        const mtml_msg = js.r(msg, "\n", "<br>");
        var mail = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent("An error has occurred at " + new Date() + "\n" + msg)}&to=cramim.community@gmail.com`;
        app.pop_err(`תקלה בביצוע הפעולה<div class="error_code">${mtml_msg}<div><a href="${mail}" target="_blank">Send</a></div></div>`, true);
    },
    clean_google_sheet_array:(array, remove_header_row, null_empty_strings)=>{
        if (remove_header_row) array.shift();
        if (null_empty_strings) {
            $.each(array, (i, item)=>{
                $.each(item, (ii, field)=>{
                    if ("" === (""+field).trim()) array[i][ii] = null;
                })
            });
        }
    },
    post: (postdata, callback)=>{
        please_wait = callback.please_wait || app.please_wait;
        please_wait(true);
        try{
            $.ajax({
                type: 'POST',
                url: app.dat.srv_url,
                accept: 'application/json',
                contentType: 'text/plain',
                async:true,
                //timeout: 10000,
                cache: false,
                data: JSON.stringify(postdata),
                success:(response)=>{
                    please_wait(false);
                    if (response?.error?.code && response?.error?.code != 0){
                        console.error("app.post.success", `act_id="${postdata.act_id}"`, response.error);
                        if (callback?.on_error_response) callback.on_error_response(response.error);
                    } else {
                        if (callback?.on_success) callback.on_success(response);
                    }
                },
                error: (jqXHR, textStatus, errorThrown)=> {
                    please_wait(false);
                    console.error("app.post.error", `act_id="${postdata.act_id}"`, jqXHR, textStatus, errorThrown);
                    if (callback?.on_connect_error) callback.on_connect_error({code:-1, desc:"app.post connection error"});
                    else app.pop_err((errorThrown && errorThrown != '')?errorThrown:"בעיית תקשורת" + ": " + postdata.act_id||"unknown act");
                }
            });
        } catch(error) {
            please_wait(false);
            console.error("app.post.catch", `act_id="${postdata.act_id}"`, error);
            app.pop_js_err(error);
            if (callback?.on_js_error) callback.on_js_error({code:-2, desc:"client side error"});
        }
    },
    build_activity_list:(response_activity_list)=>{
        app.dat.activity_list = [];
        app.dat.idx.activity_list = [];
        $.each(response_activity_list, (i, item)=>{
            const activity = {
                id: item[0],
                name: item[1],
                parent: item[2],
                description: item[3],
                hours: item[4],
                category: js.r(item[5],'"',''), // סעפש"ים bad with jquery attribute selectors
                circle: item[6],
                timing: item[7],
                members_goal: item[8] || 0,
                members_minimum: item[9],
                mambers_maximum: item[10],
                signedup: item[11] || 0,
                mandatory: item[12],
                locked: item[13],
                group_name: item[14]
            };
            if (activity.group_name) {
                var activity_group = app.dat.idx.activity_groups[activity.group_name];
                if (activity_group) {
                    activity_group.members_goal += activity.members_goal;
                    activity_group.signedup += activity.signedup;
                    activity_group.mambers_maximum += activity.mambers_maximum;
                    app.dat.idx.group_by_activity[activity.id] = activity_group;
                    return true; // JQuery continue each loop
                }
                activity_group = activity;
                app.dat.idx.activity_groups[activity.group_name] = activity;
                activity.name = activity.group_name;
                app.dat.idx.group_by_activity[activity.id] = activity_group;
            }
            app.dat.activity_list.push(activity);
            app.dat.idx.activity_list[activity.id] = activity;
            if (activity.mandatory) app.dat.mandatory_activity_list.push(activity.id);
        });
        var html = "";
        $.each(app.dat.activity_list, (i, item)=>{
            html +=
                `<div class="activity_box" activity_id="${item.id}"` + 
                    ` category="${item.category||''}"` + 
                    ` circle="${item.circle||''}"` +
                    ` timing="${item.timing||''}"` + 
                    ` already_full="${(item.mambers_maximum > 0) && (item.signedup >= item.mambers_maximum)}"` + 
                    ` signup_state="not_signed"` + 
                    ` mandatory="${item.mandatory}"` + 
                    ` locked="${item.locked}">` + 
                    `<div class="activity_box_title">${item.name||'&nbsp'}</div>` +
                    `<div class="activity_box_desc">${item.description||'&nbsp'}</div>` +
                    `<div class="activity_box_status"><table><tr>` +
                        `<td class="activity_box_status_value_title">שעות:</td><td class="activity_box_status_value">${item.hours||'&nbsp'}</td>` +
                        `<td class="activity_box_status_joined_title">הצטרפו:</td><td class="activity_box_status_joined">${item.signedup}</td>` +
                        `<td class="activity_box_status_goal_title">מתוך:</td><td class="activity_box_status_goal">${item.members_goal||'&nbsp'}</td>` +
                    `</tr></table></div>` +
                    `<div class="activity_box_toolbox">` +
                        `<div id="dv_activity_progress_${item.id}" progress="${(item.members_goal)?100*(item.signedup)/item.members_goal:'&nbsp'}" class="dv_activity_progress"></div>` +
                        `<input class="bt_activity_add" type="button" value="הצטרפ/י">` +
                    `</div>`+
                `</div>`;
        });
        $("#activity_boxes_wrapper").html(html);
        $(".dv_activity_progress").each((i,el)=>{
            app.progress_bar($(el), $(el).attr("progress"));
        });
        $(".bt_activity_add").click((ev)=>{
            app.signup($(ev.target).closest(".activity_box"));
        });
    },
    signup_tmpl:(item, signup_state)=>{ 
        tmpl =
            `<div class="user_box_item" activity_id="${item.id}" signup_state="${signup_state}" mandatory="${item.mandatory}" locked="${item.locked}">` +
                `<div class="user_box_item_toolbox">` +
                    `<div class="bt_item_delete tooltip"><span class="tooltiptext">הסר</span></div>` +
                    `<div class="bt_item_info tooltip"><span class="tooltiptext"><span>${item.name}</span><br>${item.description}</span></div>` +
                `</div>` +
                `<table class="tb_user_box_item">` +
                    `<tr><td>פעילות:</td><td class="user_box_item_title">${item.name}</td></tr>` +
                    `<tr><td>שעות:</td><td class="user_box_item_value">${item.hours||''}</td></tr>` +
                `</table>` +
            `</div>`;
        return tmpl;
    },
    build_signup_list:(response_signup_list)=>{
        app.dat.signup_list = [];
        var html = "";
        $.each(response_signup_list.reverse(), (i, item)=>{
            const activity = app.dat.idx.group_by_activity[item[1]] || app.dat.idx.activity_list[item[1]];
            if (activity) {
                app.dat.initial_signup_list.push(activity.id);
                if (!activity.mandatory) {
                    app.dat.signup_list.push(activity);
                    $(`.activity_box[activity_id='${activity.id}']`).attr("signup_state", "signed");
                    html += app.signup_tmpl(activity, "signed");
                }
            }
        });
        
        $.each(app.dat.mandatory_activity_list, (i, activity_id)=>{
            const activity = app.dat.idx.group_by_activity[activity_id] || app.dat.idx.activity_list[activity_id];
            if (activity) {
                app.dat.signup_list.push(activity);
                const signup_state  = (app.dat.initial_signup_list.indexOf(activity_id) == -1) ? "not_signed" : "signed"; 
                $(`.activity_box[activity_id='${activity.id}']`).attr("signup_state", signup_state);
                if (signup_state == "not_signed") {
                    app.dat.initial_signup_list.push(activity_id);
                    activity.save_anyway = true;
                }
                html += app.signup_tmpl(activity, "not_signed");
            }
        });

        $("#user_box_items").html(html);
        $(".bt_item_delete").click((ev)=>{
            app.unsign($(ev.target).closest(".user_box_item"));
        });
        $(".user_box_item").slideDown();
    },
    refresh_user_progress:()=>{
        var hours = 0;
        $.each(app.dat.signup_list, (i, item)=>{hours += item.hours;});
        app.progress_bar($("#user_box_progress"), hours*100/app.dat.user_goal);
        $("#user_hours").html(hours);
        $("#hours_goal").html(app.dat.user_goal);
    },
    build_user_info:(response)=>{
        app.dat.user = {
            name: "משפחת " + response.user[0],
            uid: response.user[1]
        }
        window.localStorage.setObj("cramim-parents-user", app.dat.user);
        $("#user_box_head_name").html(app.dat.user.name);
        $("#user_box_head_id").html(app.dat.user.uid);
        app.dat.user_goal = response.user_goal;
    },
    rebuild:(response)=>{
        app.dat.server_load_response = JSON.parse(JSON.stringify(response));
        app.clean_google_sheet_array(response.activity_list, false, true);
        app.build_activity_list(response.activity_list);
        app.build_signup_list(response.signup_list);
        app.build_user_info(response);
        app.enable_user_toolbox();
        app.refresh_user_progress();
        app.filter();
        app.scroll_home();
    },
    scroll_home:()=>{
        $("#main_box")[0].scrollTo({top: 0, behavior: 'smooth'});
    },
    clear:()=>{
        $("#user_box_head_name").html('');
        $("#user_box_head_id").html('');
        $("#user_box_items").html('');
        $("#activity_boxes_wrapper").html('');
        $("#filter_box_wrapper input[type='checkbox']").prop("checked", false);
        app.dat.activity_list = [];
        app.dat.idx.activity_list = {};
        app.dat.idx.activity_groups = {};
        app.dat.idx.group_by_activity = {};
        app.dat.user = {};
        app.dat.signup_list = [];
        app.dat.initial_signup_list = [];
        app.dat.mandatory_activity_list = [];
    },
    clear_storage:()=>{
        window.localStorage.setObj("cramim-parents-user", null);
    },
    changed:()=>{
        return $(".user_toolbox_enabled").length > 0;
    },
    logout:()=>{
        const do_logout = ()=>{
            app.clear();
            app.clear_storage();
            $("#eb_login").val("");
            $("#dv_login").fadeIn();
        };
        swal.ok = false;
        if (!app.changed()) do_logout();
        else swal({
            title: 'יציאה',
            html: "רגע... רגע...<br>לצאת ולאבד את כל השינויים?",
            showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'כן', cancelButtonText: 'לא',
            onAfterClose:()=>{if (swal.ok) do_logout();}
        }).then(function(result){
            if (result.dismiss) return;
            swal.ok = true;
        });
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
                app.rebuild(response);
                $("#dv_login").fadeOut();
                $("#parent").fadeIn();
            }, 
            on_error_response: (error)=>{
                if (error.code == 4) {
                    app.pop_err("לא מצאנו משפחה לפי המידע שהוקלד");
                } else app.pop_srv_err(error);
            },
            on_connect_error: on_connect_error
        });
    },
    signup: ($activity_box)=>{
        const activity_id = parseInt($activity_box.attr("activity_id"));
        const server_already = app.dat.initial_signup_list.indexOf(activity_id) > -1;
        const signup_state = (server_already)?"signed":"pending";
        $activity_box.attr("signup_state", signup_state);
        const activity = app.dat.idx.activity_list[activity_id];
        app.dat.signup_list.push(activity);
        const html = app.signup_tmpl(activity, signup_state);
        $("#user_box_items").prepend(html);
        $user_item_box = $(`.user_box_item[activity_id="${activity_id}"]`);
        $("#user_box")[0].scrollTo({top: 0});
        $user_item_box.slideDown();
        $user_item_box.find(".bt_item_delete").click((ev)=>{
            app.unsign($(ev.target).closest(".user_box_item"));
        });
        app.enable_user_toolbox();
        app.refresh_user_progress();
        if (app.on_after_signup) app.on_after_signup();
    },
    unsign: ($user_box_item)=>{
        const activity_id = parseInt($user_box_item.attr("activity_id"));
        const activity = app.dat.idx.activity_list[activity_id];
        app.dat.signup_list = app.dat.signup_list.filter((item)=>{return item.id != activity_id});
        $user_box_item.slideUp(()=>{
            $user_box_item.remove()
        });
        var $activity_box = $(`.activity_box[activity_id='${activity.id}']`);
        $activity_box.attr("signup_state", "not_signed");
        app.enable_user_toolbox();
        app.refresh_user_progress();
    },
    save:()=>{
        const post_data = {
            act_id: "save",
            uid: app.dat.user.uid,
            signup_list: [],
            unsign_list: []
        }
        var idx_signup_list = {};
        $.each(app.dat.signup_list, (i, item)=>{
            if (item.save_anyway || app.dat.initial_signup_list.indexOf(item.id) < 0) post_data.signup_list.push(item.id);
            idx_signup_list[item.id]=item;
        });
        $.each(app.dat.initial_signup_list, (i, item)=>{
            if (!idx_signup_list[item]) post_data.unsign_list.push(item);
        });
        app.post(post_data, {
            on_success :(response)=>{
                app.pop_success("הרשימה עודכנה בהצלחה :)");
                app.clear();
                app.clear_storage();
                app.rebuild(response);
            }, 
            on_error_response: app.pop_srv_err
        });
    },
    abort:()=>{
        const do_abort = ()=>{
            app.clear();
            app.rebuild(app.dat.server_load_response);
        };
        swal.ok = false;
        swal({
            title: 'ביטול שינויים',
            html: 'לאבד את כל השינויים ולהתחיל מחדש?',
            showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'כן', cancelButtonText: 'לא',
            onAfterClose:()=>{if (swal.ok) do_abort();}
        }).then(function(result){
            if (result.dismiss) return;
            swal.ok = true;
        });
    },
    filter:()=>{
        $cat_checked = $("#filter_box_cat input[type='checkbox']:checked");
        $circle_checked = $("#filter_box_circle input[type='checkbox']:checked");
        $timing_checked = $("#filter_box_timing input[type='checkbox']:checked");
        $("#activity_boxes_wrapper").hide();
        $(".activity_box").hide();
        const cat_selector_arr = [];  $cat_checked.each((i, item)=>{cat_selector_arr.push(`[category='${$(item).attr("filter_name")}']`)});
        const circle_selector_arr = [];  $circle_checked.each((i, item)=>{circle_selector_arr.push(`[circle='${$(item).attr("filter_name")}']`)});
        const timing_selector_arr = [];  $timing_checked.each((i, item)=>{timing_selector_arr.push(`[timing='${$(item).attr("filter_name")}']`)});
        const cat_selector = (cat_selector_arr.length == 0) ? "[category]" : cat_selector_arr.join();
        const circle_selector = (circle_selector_arr.length == 0) ? "[circle]" : circle_selector_arr.join();
        const timing_selector = (timing_selector_arr.length == 0) ? "[timing]" : timing_selector_arr.join();
        $(".activity_box").filter(cat_selector).filter(circle_selector).filter(timing_selector).show();
        $("#activity_boxes_wrapper").fadeIn();
    },
    progress_bar:($container, percent)=>{
        $container.html('<div class="progress_box"><div class="pb_parent"><div class="pb_div1"> <div></div></div><div class="pb_div2"> <div></div></div><div class="pb_div3"> <div></div></div><div class="pb_div4"> <div></div></div><div class="pb_div5"> <div></div></div><div class="pb_div6"> <div></div></div><div class="pb_div7"> <div></div></div><div class="pb_div8"> <div></div></div><div class="pb_div9"> <div></div></div><div class="pb_div10"><div></div> </div></div></div>');
        $container.find(".pb_parent>div").each((i,el)=>{
            $(el).toggleClass("in_progress", (i+1)*10<=percent);
        });
    },
    enable_user_toolbox:()=>{
        var enabled = app.dat.signup_list.length != app.dat.initial_signup_list.length;
        if (!enabled) {
            var idx_signup_list = {};
            $.each(app.dat.signup_list, (i, item)=>{
                if (app.dat.initial_signup_list.indexOf(item.id) < 0) enabled = true;
                idx_signup_list[item.id]=item;
                if (enabled) return false;
            });
            if (!enabled) $.each(app.dat.initial_signup_list, (i, item)=>{
                if (!idx_signup_list[item]) {
                    enabled = true;
                    return false;
                }
            });
        };
        app.on_user_toolbox_enabled(enabled);
    },
    on_user_toolbox_enabled:(enabled)=>{
        $("#user_toolbox").toggleClass("user_toolbox_enabled", Boolean(enabled));
    },
    init_scroll:()=>{
        $("#user_box").on("scroll", ()=>{
            var st = $("#user_box")[0].scrollTop;
            var hc = $("#user_box").hasClass("head_shrink");
            if (st>250 && !hc) $("#user_box").addClass("head_shrink");
            if (st<50 && hc) $("#user_box").removeClass("head_shrink");
        });
        $("#main_box").on("scroll", ()=>{
            var st = $("#main_box")[0].scrollTop;
            var hc = $("#main_box").hasClass("head_shrink");
            if (st>120 && !hc) $("#main_box").addClass("head_shrink");
            if (st<50 && hc) $("#main_box").removeClass("head_shrink");
        });
    },
    init_buttons: ()=>{
        $("#bt_home").click(app.scroll_home);
        $(".filter_box_item").click((ev)=>{
            if (ev.target.tagName.toLowerCase() == "input") return;
            $(ev.target).closest(".filter_box_item").find("input").click();
        });
        $("#bt_user_abort").click(()=>{
            app.abort();
        });
        $("#bt_user_save").click(()=>{
            app.save();
        });
        $("#frm_login").submit((e)=>{
            e.preventDefault(e);
            app.login();
        });
        $("#bt_user_exit").click(()=>{
            app.logout();
        });
        $("#filter_box_wrapper input[type='checkbox']").change(app.filter);
        window.onbeforeunload = function(){
            if (app.changed() && $("#dv_login").is(":hidden"))  return 'אזהרה! השינויים לא נשמרו.';
        };
    },
    init_user: ()=>{
        app.dat.user = window.localStorage.getObj("cramim-parents-user");
        console.log("app.init_user", app.dat.user);
    },
    show_screen_message: msg=>{
        $("#dv_screen_message").fadeIn();
        $("#dv_screen_message_txt").html(msg);
    },
    init_mode: ()=> {
        app.dat.mode = js.urlParam("mode");
        console.log("mode=", app.dat.mode);
        $("body").addClass("mode_" + app.dat.mode);
        if (app.dat.mode) $("#ttl_mode").html(app.dat.mode).show();
    },
    init: ()=>{
        console.log("app.init")
        $("#parent").hide();
        $("#dv_login").hide();
        $("#dv_screen_message").hide();
        app.init_scroll();
        app.init_buttons();
        app.init_user();
        app.init_mode();
        if (app.dat.user) {
            app.login(app.dat.user.uid, ()=>{app.show_screen_message("אין תקשורת עם השרת :(")});
        } else {
            $("#dv_login").fadeIn();
        }
        $("body").show();
    },
    start: ()=>{
        if (js.is_mobile()) {
            // app.show_screen_message("הדף עדיין לא מתאים למכשירים ניידים");
            if (window.location.href.toLowerCase().indexOf("mobile.html")<0) window.location.href = "mobile.html";
        } else {
            app.init();
        }
    }
}

$(app.start)
