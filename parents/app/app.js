//app.js
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
        if (!name) return null;
        var results = new RegExp('[\?&]' + name.toLowerCase() + '=([^&#]*)').exec(window.location.href.toLocaleLowerCase());
        if (!results) return null;
        return decodeURI(results[1]) || 0;
    },
    hebYear:year=>{
        const d = Math.trunc(year /10) % 10;
        const y = Math.trunc(year) % 10;
        const hd = 'סעפצקרשת'[d];
        const hy = (y==0) ? '' : 'אבגדהוזחטי'[y-1];
        return (y==0) ? `תש"${hd}` : `תש${hd}"${hy}`;
    },
    is_valid_email : s=> {
        if (!s) return false;
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
        return emailReg.test(s);
    },
    is_valid_phone : (s, is_cel) =>{
        if (!s) return false;
        if (s.startsWith('972')) {s = s.substring(3); if ('0123456789'.indexOf(s[0])==-1) s=s.substring(1);}
        if (s.startsWith('+972')) {s = s.substring(4); if ('0123456789'.indexOf(s[0])==-1) s=s.substring(1);}
        if (!s.startsWith('0')) s = '0' + s;
        if (s.length < 9) return false;
        if (s[0] != '0') return false;
        if (is_cel && s[1] != '5') return false;
        var number = '';
        if ('23489'.indexOf(s[1]) >-1) number = s.substring(2); 
        if ('57'.indexOf(s[1]) >-1) number = s.substring(3);
        var idx = 0;
        for(var i=0; i <number.length; i++) {
            if ('0123456789'.indexOf(number[i])>-1) break;
            idx ++;
        }
        var n = number.substring(idx);
        for(var i=0; i <n.length; i++) {    
            if ('0123456789'.indexOf(n[i])==-1) return false;
        }
        if (n.length != 7) return false;
        return true;
    },
    animate:function($el, class_name){
        $el.addClass(class_name);
        $el.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            $el.removeClass(class_name);
        });
    },
    arraysContainSameObjects:function(arrA, arrB, key) {
        if (arrA.length !== arrB.length) return false;
        const keyValuesA = arrA.map(obj => obj[key]||obj).sort();
        const keyValuesB = arrB.map(obj => obj[key]||obj).sort();
        for (let i = 0; i < keyValuesA.length; i++) {
            if (keyValuesA[i] !== keyValuesB[i]) return false; 
        }
        return true;
    }
}

var app = {
    dat:{
        srv_url: 'https://script.google.com/macros/s/AKfycbw9iVdg5gGV0OzF_KOMDVjFZkL-HrIMd9vjiF7vsO-1dNcs0eRx_L5-g9D4rMEMGDjMTQ/exec',
        server_load_response: null,
        campaign_id: null,
        user:null,
        campaign_list:null,
        activity_list:[],
        signup_list:[],
        private_list:[],
        user_goal:0,
        initial_signup_list:[],
        initial_private_list:[],
        mandatory_activity_list:[],
        mode:null,
        login_mode:"LOGIN",
        idx:{
            activity_list:{},
            activity_groups:{},
            group_by_activity:{},
            campaign_by_id:{}
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
                locked: item[13] && !app.dat.unlock,
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
        var private_idea_activity = {
            id: 'NEW_IDEA',
            name: 'רעיון לפעילות',
            description: 'לא מצאת משהו מתאים ברשימה, ויש לך רעיון לפעילות אחרת שבה תוכל/י לתרום?<br>ניתן לפרט פה ולהוסיף'
        }
        app.dat.activity_list.push(private_idea_activity);
        app.dat.idx.activity_list[private_idea_activity.id] = private_idea_activity;
        var html = "";
        $.each(app.dat.activity_list, (i, item)=>{
            html +=
                `<div class="activity_box" activity_id="${item.id}"` + 
                    ` category="${item.category||''}"` + 
                    ` circle="${item.circle||''}"` +
                    ` timing="${item.timing||''}"` + 
                    ` already_full="${(item.mambers_maximum > 0) && (item.signedup >= item.mambers_maximum) && !app.dat.unlock}"` + 
                    ` signup_state="not_signed"` + 
                    ` mandatory="${item.mandatory}"` + 
                    ` locked="${item.locked}">` + 
                    `<div class="activity_box_title"><span>${item.name||'&nbsp'}</span></div>` +
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
        const $bt_private = $(".activity_box[activity_id='NEW_IDEA'] .bt_activity_add");
        $bt_private.val("פירוט והוספה");
        $bt_private.off("click").click((ev)=>{
            app.add_private_activity($(ev.target).closest(".activity_box"));
        });
        if (app.titlesResizeObserver) app.titlesResizeObserver.disconnect();
        app.titlesResizeObserver = new ResizeObserver((entries) => {
            $.each(entries,(i, entry)=>{$(entry.target).prop("title", (entry.target.offsetWidth < entry.target.scrollWidth) ? $(entry.target).text() : '');});
        })
        $(".activity_box_title").each((i,el)=>{app.titlesResizeObserver.observe(el)});
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
    private_tmpl:(private_item)=>{ 
        tmpl =
            `<div class="user_box_item" private_activity_id="${private_item.id}" signup_state="${private_item.state}">` +
                `<div class="user_box_item_toolbox">` +
                    `<div class="bt_item_delete tooltip"><span class="tooltiptext">הסר</span></div>` +
                    `<div class="bt_item_info tooltip"><span class="tooltiptext"><span>${private_item.title}</span><br>${private_item.description}</span></div>` +
                `</div>` +
                `<table class="tb_user_box_item">` +
                    `<tr><td>פעילות:</td><td class="user_box_item_title">${private_item.title}</td></tr>` +
                    `<tr><td>שעות:</td><td class="user_box_item_value"></td></tr>` +
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
        $(".user_box_item[activity_id] .bt_item_delete").click((ev)=>{
            app.unsign($(ev.target).closest(".user_box_item"));
        });
        $(".user_box_item[activity_id]").slideDown();
    },
    build_private_list:(response_private_list)=>{
        app.dat.private_list = [];
        var html = '';
        $.each(response_private_list, (i, item)=>{
            const private_activity = {
                uid : item[0],
                id: parseInt(item[1]),
                title: item[2],
                description: item[3],
                state: 'private'
            };
            app.dat.private_list.push(private_activity);
            app.dat.initial_private_list.push(private_activity.id);
            html += app.private_tmpl(private_activity);
        });

        $("#user_box_items").append(html);
        $(".user_box_item[private_activity_id] .bt_item_delete").click((ev)=>{
            app.unsign_private($(ev.target).closest(".user_box_item"));
        });
        $(".user_box_item[private_activity_id]").slideDown();
        $("#bt_private_activity").slideDown();
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
    build_campaign_list:(response)=>{
        app.dat.campaign_list = response.campaign_list;
        app.dat.active_campaign_count = 0;
        $.each(response.campaign_list, (i, campaign)=>{
            app.dat.idx.campaign_by_id[campaign.id] = campaign;
            if (campaign.status != 'סגור') app.dat.active_campaign_count++;
        });
        if (app.dat.active_campaign_count == 1) $("#head_bt_campaign").hide();
    },
    build_campaign_menu:()=>{
        var html = ''
        $.each(app.dat.campaign_list, (i, campaign)=>{
            html += `<div id="bt_campaign_${campaign.id}" class="bt_campaign"><div></div>${campaign.title}</div>`;
        });
        $("#dv_campaign_menu_mask>div").html(html);
        $.each(app.dat.campaign_list, (i, campaign)=>{
            $("#bt_campaign_" + campaign.id + ">div").css("background-color", campaign.color);
            $("#bt_campaign_" + campaign.id).click(()=>{app.change_campaign(campaign.id)});
        });
    },
    build_title:()=>{
        $('#campaign_title').html(app.dat.idx.campaign_by_id[app.dat.campaign_id].title);
    },
    build_theme:()=>{
        document.documentElement.style.setProperty('--campaign-color', app.dat.idx.campaign_by_id[app.dat.campaign_id].color);
    },
    rebuild:(response)=>{
        app.dat.server_load_response = JSON.parse(JSON.stringify(response));
        app.clean_google_sheet_array(response.activity_list, false, true);
        app.build_activity_list(response.activity_list);
        app.build_signup_list(response.signup_list);
        app.build_private_list(response.private_list);
        app.build_user_info(response);
        app.build_campaign_list(response);
        app.build_campaign_menu();
        app.build_title();
        app.build_theme();
        app.enable_user_toolbox();
        app.refresh_user_progress();
        app.filter();
        app.scroll_home();
        app.on_after_rebuild?.call();
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
        app.dat.private_list = [];
        app.dat.initial_signup_list = [];
        app.dat.initial_private_list = [];
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
            app.set_login_mode("LOGIN");
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
    help_message_txt:{
        welcome: 
            '<div id="help_welcome">' + 
                '<div class="help_paragraph">ברוכים הבאים לממשק ההרשמה למעורבות ההורים בכרמים. מוזמנים להירשם לפעילויות בהן תרצו להשתלב. שימו לב, ההרשמה הינה לשנת תשפ"ד והיא משפחתית.</div>' +
                '<div class="help_paragraph">מצאו פעילויות ולחצו על הכפתור "הצטרפ/י".<br>הפעילויות אליהן הצטרפתם נאספות ומופיעות בצדו השמאלי של המסך.</div>' +
                '<div class="help_paragraph">העזרו באפשרויות הסינון שבראש הדף כדי למצוא פעילויות לרוחכם.</div>' +
                '<div class="help_nagging"><input id="cb_help_welcome_nagging" type="checkbox" checked="true" /><label for="cb_help_welcome_nagging">הבנתי, אין צורך להציג הודעה זו שוב.</label></div>' +
            '</div>',
        signup:'<div id="help_signup">' + 
            '<div class="help_paragraph">המשיכו לחפש ולהצטרף לפעילויות נוספות, עד שתמלאו את מכסת השעות שלכם (מותר לעבור אותה) ולסיום לחצו "שמירה".</div>' +
                '<div class="help_paragraph">בכל שלב (גם לאחר השמירה) ניתן להסיר ההצטרפות ע"י לחיצה על צלמית הפח, המופיעה במעבר העכבר, מעל כל פעילות ברשימה שלכם בצד שמאל.</div>' + 
                '<div class="help_nagging"><input id="cb_help_signup_nagging" type="checkbox" checked="true" /><label for="cb_help_signup_nagging">הבנתי, אין צורך להציג הודעה זו שוב.</label></div>' +
            '</div'
    },
    help_message:{
        show_welcome: ()=>{
            const nag_status = window.localStorage.getObj('cramim-parents-help_message-nag_status') || {};
            if (!nag_status.welcome) swal({
                title: `${app.dat.user.name}, ברוכים הבאים :)`,
                html: app.help_message_txt.welcome,
                showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'סגור',
            }).then(function(result){
                nag_status.welcome = $('#help_welcome .help_nagging>input[type="checkbox"]').is(":checked");
                window.localStorage.setObj("cramim-parents-help_message-nag_status", nag_status);
            });
        },
        show_signup: ()=>{
            const nag_status = window.localStorage.getObj('cramim-parents-help_message-nag_status') || {};
            if (!nag_status?.signup) swal({
                title: 'אחלה :)',
                html: app.help_message_txt.signup,
                showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'סגור',
            }).then(function(result){
                nag_status.signup = $('#help_signup .help_nagging>input[type="checkbox"]').is(":checked");
                window.localStorage.setObj("cramim-parents-help_message-nag_status", nag_status);
            });
        },
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
                app.rebuild(response);
                $("#dv_login").fadeOut();
                $("#parent").fadeIn();
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
        app.on_after_signup?.call();
    },
    on_after_signup: ()=>{
        app.help_message.show_signup();
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
    unsign_private: ($user_box_item)=>{
        const private_activity_id = parseInt($user_box_item.attr("private_activity_id"));
        $user_box_item.slideUp(()=>{$user_box_item.remove()});
        app.dat.private_list = app.dat.private_list .filter((item)=>{return item.id != private_activity_id});
        app.enable_user_toolbox();
        app.refresh_user_progress();
    },
    save:()=>{
        const post_data = {
            act_id: "save",
            uid: app.dat.user.uid,
            campaign_id: app.dat.campaign_id,
            signup_list: [],
            unsign_list: [],
            private_list:[],
            unsign_private_list:[]
        }

        var idx_signup_list = {};
        $.each(app.dat.signup_list, (i, item)=>{
            if (item.save_anyway || app.dat.initial_signup_list.indexOf(item.id) < 0) post_data.signup_list.push(item.id);
            idx_signup_list[item.id]=item;
        });
        $.each(app.dat.initial_signup_list, (i, item)=>{
            if (!idx_signup_list[item]) post_data.unsign_list.push(item);
        });

        var idx_private_list = {};
        $.each(app.dat.private_list, (i, item)=>{
            if (app.dat.initial_private_list.indexOf(item.id) < 0) post_data.private_list.push(item);
            idx_private_list[item.id]=item;
        });
        $.each(app.dat.initial_private_list, (i, item_id)=>{
            if (!idx_private_list[item_id]) post_data.unsign_private_list.push(item_id);
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
    signup_private_activity: (private_activity)=>{
        app.dat.private_list.push(private_activity);
        const html = app.private_tmpl(private_activity);
        $("#user_box_items").append(html);
        $user_item_box = $(`.user_box_item[private_activity_id="${private_activity.id}"]`);
        $user_item_box.slideDown(()=>{
            $("#user_box")[0].scrollTo({top:$("#user_box").height(), behavior: 'smooth'})
        });
        $user_item_box.find(".bt_item_delete").click((ev)=>{
            app.unsign_private($(ev.target).closest(".user_box_item"));
        });
        app.enable_user_toolbox();
        app.refresh_user_progress();
        app.on_after_signup?.call(this,true);
    },
    add_private_activity: ()=>{
        swal.ok = false;
        var private_activity = {};
        swal({
            title: 'רעיון לפעילות',
            html: '<div class="dlg_form"><p><input id="eb_private_activity_title" placeholder="כותרת"></p><p><textarea placeholder="פירוט הרעיון" id=eb_private_activity_description></textarea></p></div>',
            showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'אישור', cancelButtonText: 'ביטול',
            onAfterClose:()=>{if (swal.ok) app.signup_private_activity(private_activity);},
            preConfirm: function() {return new Promise(function(resolve) {
                private_activity = {
                    id: new Date().getTime(),
                    title: $("#eb_private_activity_title").val(),
                    description: $("#eb_private_activity_description").val(),
                    state: "private_new"
                }
                if (private_activity.description.trim() == '') swal.showValidationMessage('יש למלא תוכן');
                if (private_activity.title.trim() == '') swal.showValidationMessage('יש למלא כותרת');
                js.animate($(".swal2-validation-message"), "ani_bounce");
                resolve()
            })},        
        }).then(function(result){
            if (result.dismiss) return;
            swal.ok = true;
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
        const cat_arr = [];  $cat_checked.each((i, item)=>{cat_arr.push(`[category='${$(item).attr("filter_name")}']`)});
        const circle_arr = [];  $circle_checked.each((i, item)=>{circle_arr.push(`[circle='${$(item).attr("filter_name")}']`)});
        const timing_arr = [];  $timing_checked.each((i, item)=>{timing_arr.push(`[timing='${$(item).attr("filter_name")}']`)});
        const cat_selector = (cat_arr.length == 0) ? "[category]" : cat_arr.join();
        const circle_selector = (circle_arr.length == 0) ? "[circle]" : circle_arr.join();
        const timing_selector = (timing_arr.length == 0) ? "[timing]" : timing_arr.join();
        $(".activity_box").filter(cat_selector).filter(circle_selector).filter(timing_selector).show();
        $(".activity_box[activity_id='NEW_IDEA']").show();
        $("#activity_boxes_wrapper").fadeIn();
    },
    progress_bar:($container, percent)=>{
        $container.html('<div class="progress_box"><div class="pb_parent"><div class="pb_div1"> <div></div></div><div class="pb_div2"> <div></div></div><div class="pb_div3"> <div></div></div><div class="pb_div4"> <div></div></div><div class="pb_div5"> <div></div></div><div class="pb_div6"> <div></div></div><div class="pb_div7"> <div></div></div><div class="pb_div8"> <div></div></div><div class="pb_div9"> <div></div></div><div class="pb_div10"><div></div> </div></div></div>');
        $container.find(".pb_parent>div").each((i,el)=>{
            $(el).toggleClass("in_progress", (i+1)*10<=percent);
        });
    },
    // enable_user_toolbox:()=>{
    //     var enabled = app.dat.signup_list.length != app.dat.initial_signup_list.length;
    //     if (!enabled) {
    //         var idx_signup_list = {};
    //         $.each(app.dat.signup_list, (i, item)=>{
    //             if (app.dat.initial_signup_list.indexOf(item.id) < 0) enabled = true;
    //             idx_signup_list[item.id]=item;
    //             if (enabled) return false;
    //         });
    //         if (!enabled) $.each(app.dat.initial_signup_list, (i, item)=>{
    //             if (!idx_signup_list[item]) {
    //                 enabled = true;
    //                 return false;
    //             }
    //         });
    //     };
    //     app.on_user_toolbox_enabled(enabled);
    // },
    enable_user_toolbox:()=>{
        const enabled = !js.arraysContainSameObjects(
            app.dat.signup_list.concat(app.dat.private_list), 
            app.dat.initial_signup_list.concat(app.dat.initial_private_list) , 
            'id'
        );
        app.on_user_toolbox_enabled(enabled);
    },
    on_user_toolbox_enabled:(enabled)=>{
        $("#user_toolbox").toggleClass("user_toolbox_enabled", Boolean(enabled));
    },
    toggle_menu:()=>{
        const ratio = $("#header").width() / $("#header_title_1>span").width();
        // const ratio = entries[0].contentRect.width / $("#header_title_1>span").width();
        const shrink = Boolean(ratio>2.15);
        $("#head_toolbox").toggle(shrink);
        $("#head_toolbox_ico").toggle(!shrink);
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
    set_login_mode:(mode)=>{
        $("#eb_register_family_name").toggle(mode=="REGISTER");
        $("#bt_login").val((mode=="LOGIN")?"כניסה":"הרשמה");
        $("#login_register_link").html((mode=="LOGIN")?"הרשמה למשפחות חדשות":"כניסה למשפחות רשומות");
        $(".dv_login_error_msg").hide();
        app.dat.login_mode = mode;
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
        $("#head_bt_exit").click(()=>{
            app.logout();
        });
        $("#filter_box_wrapper input[type='checkbox']").change(app.filter);
        window.onbeforeunload = function(){
            if (app.changed() && $("#dv_login").is(":hidden"))  return 'אזהרה! השינויים לא נשמרו.';
        };
        $("#head_bt_contact").click(()=>{
            window.open("https://chat.whatsapp.com/Bq5DjkU7uBL9ntJuuDcuCp");
        });
        $("#head_bt_feedback").click(()=>{
            window.open("https://forms.gle/GsKDPFPszqFMJjsHA");
        });
        $("#head_bt_campaign").click(()=>{
            $("#dv_campaign_menu_mask").css("display", "flex");
        });
        $("#dv_campaign_menu_mask").click(()=>{
            $("#dv_campaign_menu_mask").fadeOut();
        });
        $("#head_toolbox_ico").click(()=>{
            $("#head_toolbox").show();
        });
        /* disabled sep 1 2022
        $("#login_register_link").click(()=>{
            app.set_login_mode((app.dat.login_mode == "LOGIN")?"REGISTER":"LOGIN");
        });
        */
        $("#bt_private_activity").click(()=>{
            app.add_private_activity();
        });
    },
    init_campaign:()=>{
        app.dat.campaign_id = js.urlParam("campaign") || 3;
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
        app.dat.unlock = Boolean(js.urlParam("unlock")=="yes");
        console.log("mode=", app.dat.mode);
        $("body").addClass("mode_" + app.dat.mode);
        if (app.dat.mode) $("#ttl_mode").html(app.dat.mode).show();
    },
    init_resize: ()=>{
        new ResizeObserver(app.toggle_menu).observe($("#header")[0]);
        $("#head_toolbox").mouseleave(app.toggle_menu);
    },
    init: ()=>{
        console.log("app.init")
        $("#parent").hide();
        $("#dv_login").hide();
        $("#dv_screen_message").hide();
        app.init_campaign();
        app.init_scroll();
        app.init_buttons();
        app.init_resize();
        app.init_user();
        app.init_mode();
        if (app.dat.user) {
            app.login(app.dat.user.uid, ()=>{app.show_screen_message("אין תקשורת עם השרת :(")}, ()=>{$("#dv_login").fadeIn();});
        } else {
            $("#dv_login").fadeIn();
        }
        $("body").show();
    },
    change_campaign:(id)=>{
        window.location.href = "index.html?campaign=" + id;
    },
    start: ()=>{
        if (js.is_mobile()) {
            // app.show_screen_message("הדף עדיין לא מתאים למכשירים ניידים");
            if (window.location.href.toLowerCase().indexOf("mobile.html")<0) {
                const query = window.location.href.split('?')[1]||'';
                window.location.href = "mobile.html" + ((query == '') ? '' : "?" + query);
            }
        } else {
            app.init();
        }
    }
}

$(app.start)
