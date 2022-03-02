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
    init: ()=>{
        $("#bt_test").click(app.get_sheet_data);
        console.log("init");
    }
}

$(app.init)