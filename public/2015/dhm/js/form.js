/**
 * Created by Administrator on 2015/5/7.
 */
$(function () {
    $("#form1").submit(function () {
        // 表单验证
        if (!$("#form1")[0].checkValidity()) {
            return;
        }
        $.ajax({
            url: '/users/add',
            type: 'post',
            dataType: 'json',
            data: $("#form1").serialize(),
            success: function (data) {

                $.messager.popup(data.msg);
            }
        });
        return false;
    });
    loadData();
    function loadData(){
        $.ajax({
            url: '/users/list',
            type: 'get',
            dataType: 'json',
            data: {activity:$("input[name='activity']").val()},
            success: function (data) {
                $.each(data,function (index,item) {
                    var newline=$(".list li:first").clone();
                    newline.find("span").eq(0).html(item.name);
                    newline.find("span").eq(1).html(item.tel);
                    newline.find("span").eq(2).html(item.address);
                    newline.find("span").eq(3).html(item.money);
                    $(".list").append(newline);
                });
            }
        });
    };


    $("#getCode").click(function(){

        $.ajax({
            url: '/users/getCode',
            type: 'post',
            dataType: 'json',
            data: {tel:$("input[name='tel']").val(),_id:$("input[name='activity']").val()},
            success: function (data) {
                $.messager.popup(data.msg);
            }
        });
    })

})