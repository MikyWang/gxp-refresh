$(document).ready(() => {
    getAllLinkedGXP();
});

function getAllLinkedGXP() {
    let data = $.cookie('cnapslist');
    cnapsList = JSON.parse(data.replace("j:", ""));
    cnapsList.forEach(cnaps => {
        if (cnaps._cnapsflag) {
            setTimeout(() => {
                $.ajax({
                    type: "GET",
                    url: ServiceIP + 'gaps/getGxpIP',
                    async: true,
                    data: { enname: cnaps._enname },
                    success: (data) => {
                        $(`select#` + cnaps._enname).val(data.orgGxpIP);
                    },
                    error: (a, error, stack) => {
                        switchModal('获取失败', '获取GXP地址失败！', false);
                    }
                })
            }, 1000);
        }
    });
}

function submitCnaps(element) {
    const id = $(element).attr('id');
    switchModal('正在修改', '正在修改二代环境' + id + '&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/submitCnaps?envName=` + id,
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            gxpIP: $('select#' + id).val(),
        }),
        success: function (data) {
            switchModal('正在修改', '正在修改二代环境' + id + '&hellip;', false);
            setTimeout(() => {
                switchModal('修改结果', data.cmdResult, false);
            }, 500);
        },
        error: err => {
            switchModal('修改失败', '修改配置失败', true);
        }
    });
}

function RefreshGaps(element) {
    const id = $(element).attr('id');
    switchModal('正在重启', '正在重启GAPS' + id + '&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/restart-gaps?envName=` + id,
        type: "GET",
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            switchModal('正在重启', '正在重启GAPS:' + id + '&hellip;', false);
            setTimeout(() => {
                switchModal('重启结果', data.cmdResult, false);
            }, 500);
        },
        error: err => {
            switchModal('重启失败', '重启GAPS失败', true);
        }
    });
}

function RefreshComm(element) {
    const id = $(element).attr('id');
    switchModal('正在重启', '正在重启收发子系统:' + id + '&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/restart-comm?envName=` + id,
        type: "GET",
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            switchModal('正在重启', '正在重启收发子系统' + id + '&hellip;', false);
            setTimeout(() => {
                switchModal('重启结果', data.cmdResult, false);
            }, 500);
        },
        error: err => {
            switchModal('重启失败', '重启GAPS失败', true);
        }
    });
}