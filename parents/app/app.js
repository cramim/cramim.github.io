var js = {
    clean_google_sheet_array:(array, remove_header_row, null_empty_strings)=>{
        if (remove_header_row) array.shift();
        if (null_empty_strings) {
            $.each(array, (i, item)=>{
                $.each(item, (ii, field)=>{
                    if ("" === (""+field).trim()) array[i][ii] = null;
                })
            });
        }
    }
};

var app = {
    dat:{
        activity_list:[]
    },
    is_mobile: false,
    please_wait:function(visible){
        $('#mask_div').toggle(Boolean(visible));
        $('#mask_div').off("click").on("click", ()=>{$('#mask_div').animate({opacity:1},10,()=>{$('#mask_div').animate({opacity:0.5},500)})});
    },
    get: (content_id, on_success, on_failure)=>{
        app.please_wait(true);
        $.ajax({
            type: 'GET',
            url: 'https://script.google.com/macros/s/AKfycbw9iVdg5gGV0OzF_KOMDVjFZkL-HrIMd9vjiF7vsO-1dNcs0eRx_L5-g9D4rMEMGDjMTQ/exec',
            accept: 'application/json',
            contentType: 'text/plain',                    
            async:true,
            //timeout: 10000,
            cache: false,
            // dataType:'json',
            data:{content_id:content_id},
            success:(response)=>{
                app.please_wait(false);
                if (response?.error){
                    console.error("app.get.success", `content_id="${content_id}"`, response.error);
                } else {
                    if (on_success) on_success(response);
                }
            },
            error: (jqXHR, textStatus, errorThrown)=> {
                app.please_wait(false);
                console.error("app.get.error", `content_id="${content_id}"`, jqXHR, textStatus, errorThrown);
            }
        });
    },
    load:()=>{
        app.get("activity", (response)=>{
            js.clean_google_sheet_array(response, true, true);
            $.each(response, (i, item)=>{app.dat.activity_list.push({
                id: item[0],
                activity: item[1],
                group: item[2],
                description: item[3],
                hours: item[4],
                category: item[5],
                circle: item[6],
                timing: item[7],
                members_goal: item[8],
                members_minimum: item[9],
                mambers_maximum: item[10],
                signedup: item[11]
            })});
            var html = "";
            $.each(app.dat.activity_list, (i, item)=>{
                html +=
                    `<div class="activity_box" activity_id="${item.id}" category="${item.category||''}" circle="${item.circle||''}" timing="${item.timing||''}">` + 
                        `<div class="activity_box_title">${item.activity||'&nbsp'}</div>` +
                        `<div class="activity_box_desc">${item.description||'&nbsp'}</div>` +
                        `<div class="activity_box_status"><table><tr>` +
                            `<td class="activity_box_status_value_title">שעות:</td><td class="activity_box_status_value">${item.hours||'&nbsp'}</td>` +
                            `<td class="activity_box_status_joined_title">הצטרפו:</td><td class="activity_box_status_joined">${item.signedup||0}</td>` +
                            `<td class="activity_box_status_goal_title">מתוך:</td><td class="activity_box_status_goal">${item.members_goal||'&nbsp'}</td>` +
                        `</tr></table></div>` +
                        `<div class="activity_box_toolbox">` +
                            `<div id="dv_activity_progress_${item.id}" progress="${(item.members_goal)?100*(item.signedup||0)/item.members_goal:'&nbsp'}" class="dv_activity_progress"></div>` +
                            `<input class="bt_activity_add" type="button" value="הצטרף">` +
                        `</div>`+
                    `</div>`;
            });
            $("#activity_boxes_wrapper").html(html);
            $(".dv_activity_progress").each((i,el)=>{
                app.progress_bar.write($(el));
                // app.progress_bar.set_progress($(el), Math.floor(Math.random() * 101));
                app.progress_bar.set_progress($(el), $(el).attr("progress"));
            });
                console.log(app.dat.activity_list);
        });
    },
    filter:()=>{
        // fliter
        $cat = $("#filter_box_cat input[type='checkbox']");
        $circle = $("#filter_box_circle input[type='checkbox']");
        $timing = $("#filter_box_timing input[type='checkbox']");
        $cat_checked = $("#filter_box_cat input[type='checkbox']:checked");
        $circle_checked = $("#filter_box_circle input[type='checkbox']:checked");
        $timing_checked = $("#filter_box_timing input[type='checkbox']:checked");
        $cat_unchecked = $("#filter_box_cat input[type='checkbox']:not(:checked)");
        $circle_unchecked = $("#filter_box_circle input[type='checkbox']:not(:checked)");
        $timing_unchecked = $("#filter_box_timing input[type='checkbox']:not(:checked)");
        $("#activity_boxes_wrapper").hide();
        $(".activity_box").show();
        if ($cat_checked.length > 0) $cat_unchecked.each((i, item)=>{$(`.activity_box[category='${$(item).attr("filter_name")}']`).hide();});
        if ($circle_checked.length > 0) $circle_unchecked.each((i, item)=>{$(`.activity_box[circle='${$(item).attr("filter_name")}']`).hide();});
        if ($timing_checked.length > 0) $timing_unchecked.each((i, item)=>{$(`.activity_box[timing='${$(item).attr("filter_name")}']`).hide();});
        $("#activity_boxes_wrapper").fadeIn();
    },
    progress_bar:{
        write:($container)=>{
            $container.html('<div class="progress_box"><div class="pb_parent"><div class="pb_div1"> <div></div></div><div class="pb_div2"> <div></div></div><div class="pb_div3"> <div></div></div><div class="pb_div4"> <div></div></div><div class="pb_div5"> <div></div></div><div class="pb_div6"> <div></div></div><div class="pb_div7"> <div></div></div><div class="pb_div8"> <div></div></div><div class="pb_div9"> <div></div></div><div class="pb_div10"><div></div> </div></div></div>');
        },
        set_progress:($container, percent)=>{
            $container.find(".pb_parent>div").each((i,el)=>{
                $(el).toggleClass("in_progress", (i+1)*10<=percent);
            });
        }
    },
    init_scroll(){
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
        $("#bt_home").click(()=>{
            $("#main_box")[0].scrollTo({top: 0, behavior: 'smooth'});
        });
        $(".filter_box_item").click((ev)=>{
            if (ev.target.tagName.toLowerCase() == "input") return;
            $(ev.target).closest(".filter_box_item").find("input").click();
        });
        $("#filter_box_wrapper input[type='checkbox']").change(app.filter);
    },
    init_mobile: ()=>{
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) app.is_mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
        console.log((app.is_mobile)?"mobile device detected":"no mobile device detected");
    },
    init_demo: ()=>{
        app.progress_bar.write($("#user_box_progress"));
        app.progress_bar.set_progress($("#user_box_progress"), 50);

        // $(".dv_activity_progress").each((i,el)=>{
        //     app.progress_bar.write($(el));
        //     app.progress_bar.set_progress($(el), Math.floor(Math.random() * 101));
        // });
    },
    init: ()=>{
        console.log("app.init")
        app.init_mobile();
        app.init_scroll();
        app.init_buttons();
        app.init_demo();
        app.load();
        $("#bt_test").click(app.get_sheet_data);
    }
}

$(app.init)
