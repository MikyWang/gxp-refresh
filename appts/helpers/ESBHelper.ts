<<<<<<< HEAD
import { File, Style, Sheet } from 'better-xlsx';
import * as fs from 'fs';
import { Entry } from '../Entry';
import { ESBFiled } from '../models/esbField';
import { FieldType } from '../Enums';

export class ESBHelper {

    private static Files: { [id: string]: File } = {};

    public static getWorkBook(id: string): File {
        if (ESBHelper.Files[id] != null) {
            return ESBHelper.Files[id];
        }
        const file = new File();
        ESBHelper.Files[id] = file;
        return file;
    }

    public static addRecordSheet(file: File, author: string) {
        const sheet = file.addSheet('修订记录');
        sheet.setColWidth(4, 4, 30);
        sheet.setColWidth(1, 1, 15);
        const row = sheet.addRow();
        let data = ['版本号', '日期', '变更类型', '修改人', '关联需求文档', '摘要', '审核人', '批准人'];
        data.forEach(value => {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
        });
        let date = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate();
        data = ['1.0', date, 'C', author, '', '新建文档', '', ''];
        const secRow = sheet.addRow();
        for (let value of data) {
            const cell = secRow.addCell();
            cell.value = value;
            cell.style = ESBHelper.normalStyle();
        }
    }

    public static addRuleSheet(file: File) {
        const sheet = file.addSheet('通讯规范');
        sheet.setColWidth(1, 6, 5);
        let exRow = (data, row) => {
            for (let value of data) {
                const cell = row.addCell();
                cell.value = value;
                cell.style = ESBHelper.normalStyle();
                cell.style.align.h = 'center';
                cell.style.align.v = 'center';
                cell.vMerge = 4;
                if (data.indexOf(value) == 1) {
                    cell.hMerge = 5;
                }
            }
        }
        const row1 = sheet.addRow();
        let data = ['通讯规范', ''];
        exRow(data, row1);
        for (let i = 0; i < 4; i++) { sheet.addRow(); }
        let row2 = sheet.addRow();
        data = ['报文规范', ''];
        exRow(data, row2);
    }

    public static addDescSheet(file: File, transInfo: ITransInfo) {
        const sheet = file.addSheet('服务描述');
        sheet.setColWidth(0, 0, 5);
        sheet.setColWidth(1, 2, 15);
        let title = ['序号', '服务项', '服务说明'];
        let data = [[1, '服务名称', transInfo.transName], [2, '交易码', transInfo.transCode], [3, '服务提供方', transInfo.transPro]
            , [4, '服务场景', transInfo.transSece], [5, '处理流程', transInfo.transFlow], [6, '接口消费方', transInfo.transUser], [7, '接口联系人', transInfo.transCtra]
            , [8, '接口联系人电话', transInfo.transCtph], [9, '其他', transInfo.extField]];
        let row = sheet.addRow();
        for (let value of title) {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
        }
        for (let rowContent of data) {
            row = sheet.addRow();
            for (let value of rowContent) {
                const cell = row.addCell();
                cell.value = value;
                cell.style = ESBHelper.normalStyle();
            }
        }
    }

    public static addInterfaceSheet(file: File, fields: ESBFiled[]): Sheet {
        const sheet = file.addSheet('服务接口');
        sheet.setColWidth(0, 1, 5);
        sheet.setColWidth(2, 3, 20);
        sheet.setColWidth(4, 6, 6);
        sheet.setColWidth(7, 7, 30);
        sheet.setColWidth(8, 8, 8);
        sheet.setColWidth(9, 14, 20);
        let data = ['类型', '序号', '字段变量名（XML报文为路径）', '字段名称', '数据类型', '最小长度', '最大长度', '约束条件'
            , '是否必输', '数据格式', '校验项', '码值说明', '备注', '取值案例'];
        const row = sheet.addRow();
        data.forEach(value => {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
            cell.style.font.bold = false;
        });


        const reqFields = fields.filter(f => f.fieldType == FieldType.Req);
        const respFields = fields.filter(f => f.fieldType == FieldType.Resp);

        let add = (fields) => {
            for (let field of fields) {
                const row = sheet.addRow();
                data = [field.fieldType == FieldType.Req ? '请求' : '响应', field.seriaNum.toString(), field.field
                    , field.fieldNm, field.dataType, field.minLen, field.maxLen, field.condition, field.valueNeeded
                    , field.dataFormat, field.checkItem, field.dict, field.extField, field.valExp];

                for (let value of data) {
                    const cell = row.addCell();
                    cell.value = value;
                    cell.style = ESBHelper.normalStyle();
                    if (fields.indexOf(field) == 0) {
                        if (data.indexOf(value) == 0) {
                            cell.vMerge = fields.length - 1;
                            cell.style.align.v = 'center';
                            cell.style.align.h = 'center';
                        }
                    }
                }
            }
        }
        add(reqFields);
        add(respFields);

        return sheet;
    }

    public static addFileSheet(file) {
        const sheet = file.addSheet('文件格式');
    }

    private static normalStyle(): Style {
        const style = new Style();
        style.align.v = 'bottom';
        style.fill.patternType = 'solid';
        style.border.bottom = 'thin';
        style.border.left = 'thin';
        style.border.right = 'thin';
        style.border.top = 'thin';
        style.font.size = 9;
        return style;
    }

    private static titleStyle(): Style {
        const style = ESBHelper.normalStyle();
        style.fill.fgColor = '00F3FF';
        style.font.bold = true;
        return style;
    }

    public static async resolveFile(file: File): Promise<string> {
        return new Promise<string>(resolve => {
            file.saveAs().pipe(fs.createWriteStream(Entry.rootdir + '/public/xlsxs/test.xlsx')).on('finish', () => {
                resolve(Entry.rootdir + '/public/xlsxs/test.xlsx');
            })
        });

    }

=======
import { File, Style, Sheet } from 'better-xlsx';
import * as fs from 'fs';
import { Entry } from '../Entry';
import { ESBFiled } from '../models/esbField';
import { FieldType } from '../Enums';

export class ESBHelper {

    private static Files: { [id: string]: File } = {};

    public static getWorkBook(id: string): File {
        if (ESBHelper.Files[id] != null) {
            return ESBHelper.Files[id];
        }
        const file = new File();
        ESBHelper.Files[id] = file;
        return file;
    }

    public static addRecordSheet(file: File, author: string) {
        const sheet = file.addSheet('修订记录');
        sheet.setColWidth(4, 4, 30);
        sheet.setColWidth(1, 1, 15);
        const row = sheet.addRow();
        let data = ['版本号', '日期', '变更类型', '修改人', '关联需求文档', '摘要', '审核人', '批准人'];
        data.forEach(value => {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
        });
        let date = new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate();
        data = ['1.0', date, 'C', author, '', '新建文档', '', ''];
        const secRow = sheet.addRow();
        for (let value of data) {
            const cell = secRow.addCell();
            cell.value = value;
            cell.style = ESBHelper.normalStyle();
        }
    }

    public static addRuleSheet(file: File) {
        const sheet = file.addSheet('通讯规范');
        sheet.setColWidth(1, 6, 5);
        let exRow = (data, row) => {
            for (let value of data) {
                const cell = row.addCell();
                cell.value = value;
                cell.style = ESBHelper.normalStyle();
                cell.style.align.h = 'center';
                cell.style.align.v = 'center';
                cell.vMerge = 4;
                if (data.indexOf(value) == 1) {
                    cell.hMerge = 5;
                }
            }
        }
        const row1 = sheet.addRow();
        let data = ['通讯规范', ''];
        exRow(data, row1);
        for (let i = 0; i < 4; i++) { sheet.addRow(); }
        let row2 = sheet.addRow();
        data = ['报文规范', ''];
        exRow(data, row2);
    }

    public static addDescSheet(file: File, transInfo: ITransInfo) {
        const sheet = file.addSheet('服务描述');
        sheet.setColWidth(0, 0, 5);
        sheet.setColWidth(1, 2, 15);
        let title = ['序号', '服务项', '服务说明'];
        let data = [[1, '服务名称', transInfo.transName], [2, '交易码', transInfo.transCode], [3, '服务提供方', transInfo.transPro]
            , [4, '服务场景', transInfo.transSece], [5, '处理流程', transInfo.transFlow], [6, '接口消费方', transInfo.transUser], [7, '接口联系人', transInfo.transCtra]
            , [8, '接口联系人电话', transInfo.transCtph], [9, '其他', transInfo.extField]];
        let row = sheet.addRow();
        for (let value of title) {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
        }
        for (let rowContent of data) {
            row = sheet.addRow();
            for (let value of rowContent) {
                const cell = row.addCell();
                cell.value = value;
                cell.style = ESBHelper.normalStyle();
            }
        }
    }

    public static addInterfaceSheet(file: File, fields: ESBFiled[]): Sheet {
        const sheet = file.addSheet('服务接口');
        sheet.setColWidth(0, 1, 5);
        sheet.setColWidth(2, 3, 20);
        sheet.setColWidth(4, 6, 6);
        sheet.setColWidth(7, 7, 30);
        sheet.setColWidth(8, 8, 8);
        sheet.setColWidth(9, 14, 20);
        let data = ['类型', '序号', '字段变量名（XML报文为路径）', '字段名称', '数据类型', '最小长度', '最大长度', '约束条件'
            , '是否必输', '数据格式', '校验项', '码值说明', '备注', '取值案例'];
        const row = sheet.addRow();
        data.forEach(value => {
            const cell = row.addCell();
            cell.value = value;
            cell.style = ESBHelper.titleStyle();
            cell.style.font.bold = false;
        });


        const reqFields = fields.filter(f => f.fieldType == FieldType.Req);
        const respFields = fields.filter(f => f.fieldType == FieldType.Resp);

        let add = (fields) => {
            for (let field of fields) {
                const row = sheet.addRow();
                data = [field.fieldType == FieldType.Req ? '请求' : '响应', field.seriaNum.toString(), field.field
                    , field.fieldNm, field.dataType, field.minLen, field.maxLen, field.condition, field.valueNeeded
                    , field.dataFormat, field.checkItem, field.dict, field.extField, field.valExp];

                for (let value of data) {
                    const cell = row.addCell();
                    cell.value = value;
                    cell.style = ESBHelper.normalStyle();
                    if (fields.indexOf(field) == 0) {
                        if (data.indexOf(value) == 0) {
                            cell.vMerge = fields.length - 1;
                            cell.style.align.v = 'center';
                            cell.style.align.h = 'center';
                        }
                    }
                }
            }
        }
        add(reqFields);
        add(respFields);

        return sheet;
    }

    public static addFileSheet(file) {
        const sheet = file.addSheet('文件格式');
    }

    private static normalStyle(): Style {
        const style = new Style();
        style.align.v = 'bottom';
        style.fill.patternType = 'solid';
        style.border.bottom = 'thin';
        style.border.left = 'thin';
        style.border.right = 'thin';
        style.border.top = 'thin';
        style.font.size = 9;
        return style;
    }

    private static titleStyle(): Style {
        const style = ESBHelper.normalStyle();
        style.fill.fgColor = '00F3FF';
        style.font.bold = true;
        return style;
    }

    public static async resolveFile(file: File): Promise<string> {
        return new Promise<string>(resolve => {
            file.saveAs().pipe(fs.createWriteStream(Entry.rootdir + '/public/xlsxs/test.xlsx')).on('finish', () => {
                resolve(Entry.rootdir + '/public/xlsxs/test.xlsx');
            })
        });

    }

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}