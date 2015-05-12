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
                $.messager.popup(data.str);
            }
        });
        return false;
    })

})