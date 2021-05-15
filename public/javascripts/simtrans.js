const current = { normalTrans: new NormalTrans() };
$(document).ready(() => {
    addEvents();
    GetNormalTrans('hvps');
});

function addEvents() {
    $('select#trans').on('change', () => {
        var trans = $('select#trans').val();
        switchModal('正在切换', '正在切换交易' + trans + '&hellip;', false);
        $.ajax({
            type: "GET",
            url: ServiceIP + 'gaps/gettrans?trans=' + trans,
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
    $('select#paytrans').on('change', () => {
        var type = $('select#paytrans').val();
        GetNormalTrans(type);
    });
}

function NormalTrans() {
    this.pub = new Pub();
    this.hupp = new Hupp();
}

function GetNormalTrans(type) {
    switchModal('正在获取交易初始数据', '正在获取交易初始数据&hellip;', false);
    $.ajax({
        type: "GET",
        url: ServiceIP + 'gaps/getnormaltrans?type=' + type,
        async: true,
        success: function (resp) {
            switchModal();
            current.normalTrans = resp;
        },
        error: function (a, error, stack) {
            switchModal();
            setTimeout(() => {
                switchModal('获取交易失败', error, false);
            }, 500);
        }
    });
}

function updatePay() {
    var pay = current.normalTrans;
    var elem = $('input#channelid');
    pay.pub.channelid = $('input#channelid').val();
    pay.pub.channelseq = $('input#channelseq').val();
    pay.pub.transdep = $('input#transdep').val();
    pay.pub.operator = $('input#operator').val();
    pay.pub.termnum = $('input#termnum').val();
    pay.pub.auther = $('input#auther').val();
    pay.hupp.payeraccno = $('input#payeraccno').val();
    pay.hupp.payername = $('input#payername').val();
    pay.hupp.rcveraccno = $('input#rcveraccno').val();
    pay.hupp.rcvername = $('input#rcvername').val();
    pay.hupp.rcverbkid = $('input#rcverbkid').val();
    pay.hupp.rcverbknm = $('input#rcverbknm').val();
    pay.hupp.amt = $('input#amt').val();
    pay.hupp.txtpcd = $('input#txtpcd').val();
    pay.hupp.txctgypurpcd = $('input#txctgypurpcd').val();
    pay.hupp.recvbkid = $('input#recvbkid').val();
    pay.hupp.ps = $('input#ps').val();
    pay.hupp.addword = $('input#addword').val();
    current.normalTrans = pay;
    return current.normalTrans;
}

function SendTrans(elem) {
    var env = $('select#env').val();
    switchModal('正在发送', '正在发送交易至' + env + '环境&hellip;', false);
    var data = {
        env: env,
        trans: $('select#trans').val(),
        request: $('textarea#request').val()
    }
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gaps/sendtrans',
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



function SendNormalTrans(elem) {
    var env = $('select#payenv').val();
    current.normalTrans = updatePay();
    switchModal('正在发送', '正在发送交易至' + env + '环境&hellip;', false);
    $.ajax({
        type: "POST",
        url: ServiceIP + 'gaps/sendnormaltrans?env=' + env + '&data=' + JSON.stringify(current.normalTrans),
        async: true,
        success: function (resp) {
            switchModal();
            setTimeout(() => {
                switchModal('响应结果', resp.cmdResult, false);
                $('textarea#payresponse').val(resp.data.join());
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
        url: ServiceIP + 'gaps/uploadtrans',
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

function Pub() {
    this.appid = ''
    this.transcode = '';
    this.provno = '';
    this.transdep = '';
    this.operator = '';
    this.transdate = '';
    this.transtime = '';
    this.channelid = '';
    this.termnum = '';
    this.channelseq = ''
    this.auther = '';
    this.jiaoyima = '';
}

function Hupp() {
    this.interfacetp = '';
    this.businum = '';
    this.msgtp = '';
    this.recvbkid = '';
    this.txtpcd = '';
    this.txctgypurpcd = '';
    this.ccy = '';
    this.amt = '';
    this.feeamt = '';
    this.feetflagcollect = '';
    this.feeflagtransfer = '';
    this.doubleflag = '';
    this.trntype = '';
    this.txsttlmprty = '';
    this.payeraccno = '';
    this.payername = '';
    this.payeraddr = '';
    this.payerbkid = '';
    this.payerbknm = '';
    this.rcveraccno = '';
    this.rcvername = '';
    this.rcveraddr = '';
    this.rcverbkid = '';
    this.rcverbknm = '';
    this.ps = '';
    this.ps2 = '';
    this.addword = '';
    this.addword2 = '';
    this.checkoper = '';
    this.intermediarybkid1 = '';
    this.Intermediarybkid2 = '';
    this.excsendflg = '';
    this.addinfo_gk = '';
    this.authpasswd = '';
    this.zftj = '';
    this.passwd = '';
    this.cardseq = '';
    this.payersttlmacct = '';
    this.payersttlmacctnm = '';
    this.send_flag = '';
    this.gzauthflag = '';
}