const ServiceIP = `/`;

$(document).ready(() => {
    let gxpFlag = $.cookie('gxpFlag');
    if (gxpFlag == 'true') {
        getAllLinkedGXP();
        getGxpIP();
    }
});

function getAllLinkedGXP() {
    let data = $.cookie('cnapslist');
    cnapsList = JSON.parse(data.replace("j:", ""));
    cnapsList.forEach(cnaps => {
        if (cnaps._cnapsflag) {
            $.ajax({
                type: "GET",
                url: ServiceIP + 'gaps/getGxpIP',
                async: true,
                data: { enname: cnaps._enname },
                success: (data) => {
                    $(`span#` + cnaps._enname).html(data.orgGxpIP);
                },
                error: (a, error, stack) => {
                    $(`span#` + cnaps._enname).html('获取失败！');
                }
            })
        }
    });
}

function getGxpIP() {
    let envName = $.cookie('envname');
    $.ajax({
        type: "GET",
        url: ServiceIP + 'gaps/getGxpIP',
        async: true,
        data: { enname: envName },
        success: (data) => {
            $('input#orgGxpIP').val(data.orgGxpIP);
            $('input#orgSubmitName').val(data.env.orgMan);
            $('input#orgSubmitNote').val(data.env.orgNote);
            $('input#orgSubmitDate').val(data.env.orgDate);
        },
        error: (a, error, stack) => {
            $('input#orgGxpIP').val('获取失败！');
        }
    })
}

function refreshEnv(element) {
    var id = $(element).attr('id');
    var envName = $('span#' + id).html();
    switchModal('正在重置', '正在重置环境' + envName + '&hellip;', false);
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gxp/resolveRefresh',
        async: true,
        data: { enname: envName },
        success: function (data) {
            $('#refreshResult').html(data.result);
            $('#gxpRefresh').show();
            switchModal('', '', false);
        },
        error: function (a, error, stack) {
            $('#refreshResult').html('重置失败');
            $('#gxpRefresh').show();
            switchModal('', '', false);
        }
    });
}

function resetDevice(element) {
    $.ajax({
        url: ServiceIP + `gxp/showdetail`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            configName: $(element).attr('id')
        },
        success: function (data) {
            $('#detail').html(data);
        }
    });
}

function submitDevice(element) {
    $.ajax({
        url: ServiceIP + `gxp/submitDevice`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            configDetail: {
                configId: $(element).attr('id'),
                serviceIP: $('input#deviceIp').val(),
                port: $('input#devicePort').val(),
                flow: $('input#deviceFlow').val(),
                eflow: $('input#deviceEflow').val()
            }
        },
        success: function (data) {
            switchModal('修改配置', '修改成功', true);
        }
    });
}

function submitCnaps(element) {
    switchModal('正在修改', '正在修改二代环境' + $.cookie('envname') + '&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/submitCnaps?envName=` + $.cookie('envname'),
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            orgGxpIP: $('select#GxpIP').val(),
            orgMan: $('input#submitName').val(),
            orgNote: $('input#submitNote').val(),
            orgDate: $('input#submitDate').val(),
            clientIP: $('input#submitIP').val()
        }),
        success: function (data) {
            switchModal('正在修改', '正在修改二代环境' + $.cookie('envname') + '&hellip;', false);
            $('#cnapsRefreshResult').html(data.cmdResult);
            $('#cnapsRefresh').show();
            getGxpIP();
        },
        error: err => {
            switchModal('修改失败', '修改配置失败', true);
        }
    });
}

function chooseConfig(element) {
    $(element).parent().children().removeClass('active');
    $(element).addClass('active');
    $.ajax({
        url: ServiceIP + `gxp/showDevice`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            configType: $(element).attr('id')
        },
        success: function (data) {
            $('#device').html(data);
            chooseDevice($(`div#适配器` + `>a.active`));
        }
    });
}

function searchDevice(element) {
    $.ajax({
        url: ServiceIP + `gxp/searchDevice`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            searchText: $('input#' + $(element).attr('id')).val()
        },
        success: function (data) {
            $('#device').html(data);
            chooseDevice($(`div#` + $(element).attr('id') + `>a.active`));
        }
    });
}


function chooseDevice(element) {
    $(element).parent().children().removeClass('active');
    $(element).addClass('active');
    $.ajax({
        url: ServiceIP + `gxp/showdetail`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            configName: $(element).attr('id')
        },
        success: function (data) {
            $('#detail').html(data);
        }
    });
}

function chooseIP(element) {
    var envname = $(element).html().split('-')[1].replace(' ', '');
    location.search = `?envName=` + envname;
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
