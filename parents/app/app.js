var app = {
    get_sheet_data: ()=>{
        $.ajax({
            type: 'GET',
            url: 'https://script.google.com/macros/s/AKfycbw9iVdg5gGV0OzF_KOMDVjFZkL-HrIMd9vjiF7vsO-1dNcs0eRx_L5-g9D4rMEMGDjMTQ/exec',
            // contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            accept: 'application/json',
            contentType: 'text/plain',                    
            async:true,
            //timeout: 10000,
            cache: false,
            // dataType:'json',
            // data:JSON.stringify(json_post_data),
            success: (response)=>{
                $("#mm_test").val(response);
                console.log(response);
            },
            error: (jqXHR, textStatus, errorThrown)=> {
            }
        });
        console.log("get_sheet_data");
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
    },
    init: ()=>{
        app.init_scroll();
        app.init_buttons();
        app.progress_bar.write($("#user_box_progress"));
        app.progress_bar.set_progress($("#user_box_progress"), 50);

        $(".dv_activity_progress").each((i,el)=>{
            app.progress_bar.write($(el));
            app.progress_bar.set_progress($(el), Math.floor(Math.random() * 101));
        });
        
        // app.progress_bar.set_progress($("#dv_progress_test"));
        $("#bt_test").click(app.get_sheet_data);
        console.log("init");
    }
}

$(app.init)
