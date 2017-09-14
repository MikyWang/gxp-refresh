function refreshEnv(element) {
    var id = $(element).attr('id');
    var envName = $('span#' + id).html();
    switchModal('正在重置', '正在重置环境' + envName + '&hellip;', false);
    $.ajax({
        type: "POST",
        url: 'http://localhost:8000/gxp/resolveRefresh',
        async: true,
        data: { enname: envName },
        success: function(data) {
            $('#refreshResult').html(data.result);
            $('#gxpRefresh').show();
            switchModal('', '', false);
        },
        error: function(a, error, stack) {
            $('#refreshResult').html('重置失败');
            $('#gxpRefresh').show();
            switchModal('', '', false);
        }
    });
}


function switchModal(title, body, isNeedFooter) {
    $('#modalTitle').html(title);
    $('#modalBody').html(body);
    if (isNeedFooter) {
        $('#modalFooter').show();
    } else {
        $('#modalFooter').hide();
    }
    $('#modal').modal('toggle');
}