const ServiceIP = `/`;
<<<<<<< HEAD
$.cookie('eventId', 0);
=======

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
>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0

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
            $.cookie('eventId', 1);
            switchModal('修改配置', '修改成功', true);
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

function modalEvent(element) {
    switchModal();
    setTimeout(() => {
        const eventId = Number.parseInt($.cookie('eventId'));
        switch (eventId) {
            case 1:
                $.cookie('eventId', 2);
                switchModal('重启环境', '是否立即生效？', true);
                break;
            case 2:
                const envName = $.cookie('envname');
                $.cookie('eventId', 0);
                switchModal('正在重启', '正在重启环境' + envName + '&hellip;', false);
                $.ajax({
                    type: "POST",
                    url: ServiceIP + 'gxp/resolveRefresh',
                    async: true,
                    data: { enname: envName },
                    success: function (data) {
                        switchModal();
                        setTimeout(() => {
                            switchModal('重启环境成功', data.result, false);
                        }, 500);
                    },
                    error: function (a, error, stack) {
                        switchModal();
                        setTimeout(() => {
                            switchModal('重启环境失败', error, false);
                        }, 500);
                    }
                });
                break;
            case 3:
                $.cookie('eventId', 0);
                uploadTrans();
                break;
            default:
                break;
        }
    }, 500);
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


function submitDxzp(element) {
    switchModal('正在添加', '正在添加名单至' + $.cookie('envname') + '环境&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/submitDxzp?envName=` + $.cookie('envname'),
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            cardType: $('select#cardtype').val(),
            mdData: $('input#mddata').val(),
            busType: $('select#bustype').val(),
            mdName: $('input#mdname').val(),
        }),
        success: function (data) {
            switchModal('正在添加', '正在添加' + $.cookie('envname') + '环境&hellip;', false);
            $('#dxzpResult').html(data.cmdResult);
            $('#dxzpModify').show();
        },
        error: err => {
            switchModal('添加失败', '添加名单失败', true);
        }
    });
<<<<<<< HEAD
}

function deleteDxzp(element) {
    switchModal('删除名单', '正在删除&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/deleteDxzp?envName=` + $.cookie('envname'),
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            cardType: $('select#cardtype').val(),
            mdData: $('input#mddata').val(),
            busType: $('select#bustype').val(),
            mdName: $('input#mdname').val(),
        }),
        success: function (data) {
            switchModal('删除名单', '正在删除&hellip;', false);
            $('#dxzpResult').html(data.cmdResult);
            $('#dxzpModify').show();
        },
        error: err => {
            switchModal('删除失败', '删除名单失败', true);
        }
    });
}

function deleteAllDxzp(element) {
    switchModal('清空名单', '正在清空&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/deleteAllDxzp?envName=` + $.cookie('envname'),
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            cardType: $('select#cardtype').val(),
            mdData: $('input#mddata').val(),
            busType: $('select#bustype').val(),
            mdName: $('input#mdname').val(),
        }),
        success: function (data) {
            switchModal('清空名单', '正在清空&hellip;', false);
            $('#dxzpResult').html(data.cmdResult);
            $('#dxzpModify').show();
        },
        error: err => {
            switchModal('清空失败', '清空名单失败', true);
        }
    });
}
=======
}
>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
