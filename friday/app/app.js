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
    downloadCSVFile:(s_data, fname)=>{
        var BOM = new Uint8Array([0xEF,0xBB,0xBF]);
        file = new Blob([BOM, s_data], {type: "text/csv;charset=utf8"});
        var temp_link = document.createElement('a');
        temp_link.download = fname + ".csv";
        var url = window.URL.createObjectURL(file);
        temp_link.href = url;
        temp_link.style.display = "none";
        document.body.appendChild(temp_link);
        temp_link.click();
        document.body.removeChild(temp_link);
    }
}

var app = {
    dat:{
        srv_url: 'https://script.google.com/macros/s/AKfycbw9iVdg5gGV0OzF_KOMDVjFZkL-HrIMd9vjiF7vsO-1dNcs0eRx_L5-g9D4rMEMGDjMTQ/exec',
        server_load_response: null,
        idx:{
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
    show_screen_message: msg=>{
        $("#dv_screen_message").fadeIn();
        $("#dv_screen_message_txt").html(msg);
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
    get_results_html:(spaces)=>{
        var html = '';
        $.each(spaces, (i_space, space)=>{
            var space_html = '';
            for(var i = 0; i < space.seats; i++) {
                space_html += `<tr><td>${i+1}</td><td>${space.kids[i]?.name||''}</td><td>${space.kids[i]?.class||''}</td><td>${space.kids[i]?.val||''}</td></tr>`; 
            }
            html += `<div class="space_box"><div class="space_title">${space.name}</div><table class="tb_space">${space_html}</table></div>`;
        });
        return html;
    },
    assign:(class_data)=>{
        const spaces = [];
        const kids = [];
        const matrix = [];
        const space_idx = {};
        const set_spaces = ()=>{
            var idx = 0;
            $.each(class_data[0],(i_col, cell)=> {
                if (i_col <= 1) return true;
                const space = {
                    name:cell.split("_")[0],
                    seats:parseInt(cell.split("_")[1]),
                    data_col:i_col,
                    kids:[]
                }
                for(var i = 0; i < space.seats; i++) {
                    space_idx[idx] = space;
                    idx++;
                }
                spaces.push(space);
            });
        }
        const set_kids  = ()=>{
            $.each(class_data,(i_row, row)=>{
                if (i_row == 0) return true;
                const kid = {
                    name : row[0],
                    class : row[1]
                }
                kids.push(kid);
            });
        };
        const set_matrix  = ()=>{
            $.each(class_data,(i_row, row)=>{
                if (i_row == 0) return true;
                const matrix_row = [];
                $.each(row,(i_col, cell)=> {
                    if (i_col <= 1) return true;
                    const space = spaces[i_col-2];
                    for(var i = 0; i < space.seats; i++) {
                        const val = (cell=='')?1000:cell;
                        matrix_row.push(val);
                    }
                });
                matrix.push(matrix_row);
            });
        };
        set_spaces();
        set_kids();
        set_matrix();
        const assignments = computeMunkres(matrix, {padValue:1000});
        $.each(assignments, (i, assignment)=>{
            const space = space_idx[assignment[1]];
            const kid = Object.assign(kids[assignment[0]], {val:class_data[assignment[0]+1][space.data_col]});
            space.kids.push(kid);
        });
        $.each(spaces, (i, space)=>space.kids.sort((a, b) => a.val - b.val));
        return spaces;
    },
    load:()=>{
        $("#toolbox_error").hide();
        const post_data = {
            act_id:"load_friday"
        }
        app.post(post_data, {
            on_success:(data)=>{
                app.dat.spaces = {
                    class_First:app.assign(data.class_First),
                    class_SecondThird:app.assign(data.class_SecondThird),
                    class_FourthFifth:app.assign(data.class_FourthFifth),
                };
                var html = '';
                html += "<div class='class_header'>כיתות א'</div>";
                html += app.get_results_html(app.dat.spaces.class_First);
                html += "<div class='class_header'>כיתות ב'-ג'</div>";
                html += app.get_results_html(app.dat.spaces.class_SecondThird);
                html += "<div class='class_header'>כיתות ד'-ה'</div>";
                html += app.get_results_html(app.dat.spaces.class_FourthFifth);
                $("#results_wrapper").html(html);
            }
        });
    },
    assign_request:()=>{
        $("#toolbox_error").hide();
        const input_sheet_address = $("#eb_input_sheet_address").val().trim();
        if (input_sheet_address == '') {
            $("#toolbox_error").html("⚠ נא למלא כתובת גיליון");
            $("#toolbox_error").slideDown();
            return;
        }
        const post_data = {
            act_id:"friday_assign",
            input_sheet_address: input_sheet_address,
            save:$('#cb_save').is(":checked")
        }
        app.post(post_data, {
            on_success:(data)=>{
                var html = '';
                html += `<div class='class_header'>${data.name}</div>`;
                html += app.get_results_html(data.spaces);
                $("#results_wrapper").html(html);
            },
            on_error_response:error=>app.pop_err("תקלה בביצוע הפעולה")
        });
    },
    init_buttons:()=>{
        $("#bt_assign").click(app.load);
        //$("#bt_assign").click(app.assign_request);
    },
    init: ()=>{
        console.log("app.init")
        $("body").show();
        app.init_buttons();
        $("#dv_screen_message").hide();
    },
    start: ()=>{
        app.init();
        /*
        if (js.is_mobile()) {
            $("body").show();
            app.show_screen_message("הדף עדיין לא מתאים למכשירים ניידים");
            // if (window.location.href.toLowerCase().indexOf("mobile.html")<0) {
            //     const query = window.location.href.split('?')[1]||'';
            //     window.location.href = "mobile.html" + ((query == '') ? '' : "?" + query);
            // }
        } else {
            app.init();
        }
        */
    }
}

$(app.start)
