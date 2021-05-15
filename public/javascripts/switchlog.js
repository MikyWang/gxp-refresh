function switchLog(element) {
    const serinum = $('#serialnum').val();
    $.ajax({
        type: "GET",
        url: ServiceIP + 'gaps/switchLog',
        async: true,
        data: { serinum: serinum },
        success: (data) => {
            console.log(data);
            $(`div#log`).html(data);
        },
        error: (a, error, stack) => {
            $(`div#log`).html('获取失败！');
        }
    })
}