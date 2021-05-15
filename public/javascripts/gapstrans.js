$(document).ready(() => {
    addEvents();
});

function addEvents() {
    $('select#trans').on('change', () => {
        var trans = $('select#trans').val();
        switchModal('正在切换', '正在切换交易' + trans + '&hellip;', false);
        $.ajax({
            type: "GET",
            url: ServiceIP + 'gaps/getgapstrans?trans=' + trans,
            async: true,
            success: function (resp) {
                switchModal();
                $('textarea#request').val(resp);
            },
            error: function (a, error, stack) {
                switchModal();
                setTimeout(() => {
                    switchModal('切换失败', error, false);
                }, 500);
            }
        });
    });
}

function SendTrans(elem) {
    var env = $('select#env').val();
    switchModal('正在发送', '正在发送交易至' + env + '环境&hellip;', false);
    var data = {
        env: env,
        trans: $('select#trans').val(),
        sys: $('select#sys').val(),
        request: $('textarea#request').val()
    }
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gaps/sendgapstrans',
        async: true,
        data: data,
        success: function (resp) {
            switchModal();
            setTimeout(() => {
                switchModal('响应结果', resp.cmdResult, false);
                $('textarea#response').val(resp.data.join());
            }, 500);
        },
        error: function (a, error, stack) {
            switchModal();
            setTimeout(() => {
                switchModal('发送失败', error, false);
            }, 500);
        }
    });
}

function ImportTrans(elem) {
    switchModal('上传交易', '正在生成添加交易界面&hellip;', false);
    $.ajax({
        type: "GET",
        url: ServiceIP + 'gaps/import',
        async: true,
        success: function (resp) {
            switchModal();
            setTimeout(() => {
                $.cookie('eventId', 3);
                switchModal('导入交易', resp, true);
            }, 500);
        },
        error: function (a, error, stack) {
            switchModal();
            setTimeout(() => {
                switchModal('界面生成异常', error, false);
            }, 500);
        }
    });
}

function uploadTrans() {
    var data = {
        env: null,
        trans: $('input#transname').val(),
        request: $('textarea#transdata').val()
    }
    switchModal('上传交易', '正在上传&hellip;', false);
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gaps/uploadgapstrans',
        async: true,
        data: data,
        success: function (resp) {
            switchModal();
            setTimeout(() => {
                switchModal('上传成功', resp, false);
                location.reload();
            }, 500);
        },
        error: function (a, error, stack) {
            switchModal();
            setTimeout(() => {
                switchModal('发送失败', error, false);
            }, 500);
        }
    });
}