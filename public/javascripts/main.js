const ServiceIP = `/`;

function refreshEnv(element) {
    var id = $(element).attr('id');
    var envName = $('span#' + id).html();
    switchModal('正在重置', '正在重置环境' + envName + '&hellip;', false);
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gxp/resolveRefresh',
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

function resetDevice(element) {
    $.ajax({
        url: ServiceIP + `gxp/showdetail`,
        type: "GET",
        async: true,
        data: {
            envName: $.cookie('envname'),
            configName: $(element).attr('id')
        },
        success: function(data) {
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
        success: function(data) {
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
        success: function(data) {
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
        success: function(data) {
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
        success: function(data) {
            $('#detail').html(data);
        }
    });
}

function chooseIP(element) {
    var envname = $(element).html().split('-')[1].replace(' ', '');
    location.href = ServiceIP + `gxp/modify?envName=` + envname;
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