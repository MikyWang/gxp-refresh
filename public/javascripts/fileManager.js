function downloadFlow() {
    switchModal('正在下载', '正在下载流程转向&hellip;', false);
    $.ajax({
        url: ServiceIP + `file/flow-download`,
        type: "get",
        async: true,
        success: (data) => {
            switchModal('正在下载', '正在下载流程转向&hellip;', false);
            location.href = ServiceIP + data;
        }
    });
}

function downloadIcaPort() {
    switchModal('正在下载', '正在下载端口统计&hellip;', false);
    $.ajax({
        url: ServiceIP + `file/ica-ports`,
        type: "get",
        async: true,
        success: (data) => {
            switchModal('正在下载', '正在下载端口统计&hellip;', false);
            location.href = ServiceIP + data;
        }
    });
}