$(document).ready(() => {
    queryRecords("");
});

function queryRecords(elem) {
    const businum = $('input#businum').val();
    const tableName = $('select#businum').val();
    switchModal('正在查询', '正在查询' + $.cookie('envname') + '流水&hellip;', false);
    $.ajax({
        url: ServiceIP + `gaps/queryRecords?envName=` + $.cookie('envname'),
        type: "POST",
        async: true,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            businum: businum,
            tableName: tableName,
        }),
        success: (data) => {
            $('div#recordTable').html(data);
            switchModal('正在查询', '正在查询' + $.cookie('envname') + '流水&hellip;', false);
        }
    });
}