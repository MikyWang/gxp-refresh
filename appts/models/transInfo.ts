<<<<<<< HEAD
import { ESBFiled } from "./esbField";
import { FieldType } from "../Enums";

export class TransInfo<T> implements ITransInfo {

    public init(transInfo: ITransInfo) {
        this.transCode = transInfo.transCode;
        this.transCtph = transInfo.transCtph;
        this.transCtra = transInfo.transCtra;
        this.transName = transInfo.transName;
        this.transPro = transInfo.transPro;
        this.transSece = transInfo.transSece;
        this.transUser = transInfo.transUser;
    }

    public transCode: string;
    public transName: string;
    public transCtph: string;
    public transCtra: string;
    public transPro: string;
    public transSece: string;
    public transUser: string;

    private type: T;

    private get IsESBTrans() {
        return true;
    }

    // public dataResolve(data: any) {
    //     let type = FieldType.Req;
    //     let isJump = false;
    //     let count = 1;
    //     if (this.IsESBTrans) {
    //         this.transName = data[3][2];
    //         this.transSece = data[4][2];
    //         for (let row of data) {
    //             if (isJump) {
    //                 isJump = false;
    //                 continue;
    //             }
    //             row = row.filter(c => c != '');
    //             if (row.length == 1) {
    //                 if (row[0] == `[请求报文]`) {
    //                     type = FieldType.Req;
    //                     isJump = true;
    //                     count = 1;
    //                 } else if (row[0] == `[响应报文]`) {
    //                     type = FieldType.Resp;
    //                     isJump = true;
    //                     count = 1;
    //                 }
    //             }
    //             if (row.length >= 6) {
    //                 let field = new ESBFiled();
    //                 field.fieldType = type;
    //                 field.seriaNum = count;
    //                 field.field = row[2];
    //                 field.fieldNm = row[1];
    //                 field.dataType = row[3] == 'N' ? 'NUM' : 'STR';
    //                 field.Length = field.Length = row[4];
    //                 field.condition = row.length > 6 ? row[6] : '';
    //                 field.valueNeeded = row[5] == 'M' ? '是' : '否';
    //                 field.dataFormat = '';
    //                 field.checkItem = '';
    //                 field.dict = '';
    //                 field.extField = '';
    //                 field.valExp = '';
    //                 this.fields.push(field);
    //                 count++;
    //             }
    //         }
    //     }
    // }

    public dataResolve(data: any, db: string) {
        let type = FieldType.Req;
        let isJump = false;
        let count = 1;
        if (this.IsESBTrans) {
            this.transName = '定期借记录入复核一体化';
            this.transSece = '定期借记';
            for (let row of data) {
                // if (isJump) {
                //     isJump = false;
                //     continue;
                // }
                row = row.filter(c => c != '');
                if (row.length == 1) {
                    if (row[0] == `[请求报文]`) {
                        type = FieldType.Req;
                        // isJump = true;
                        count = 1;
                        continue;
                    } else if (row[0] == `[响应报文]`) {
                        type = FieldType.Resp;
                        // isJump = true;
                        count = 1;
                        continue;
                    }
                }
                if (row.length >= 4) {
                    let field = new ESBFiled();
                    field.fieldType = type;
                    field.seriaNum = count;
                    field.field = (type == FieldType.Req ? (count < 16 ? '/root/pub/' : '/root/hupp/') : '/root/resp/') + row[3];
                    field.fieldNm = row[0];
                    field.dataType = row[2].indexOf('Char') > -1 ? 'STR' : 'NUM';
                    field.Length = field.dataType != 'STR' ? '15' : row[2].split('(')[1].split(')')[0];
                    field.condition = '';
                    field.valueNeeded = row[1] == 'M' ? '是' : '否';
                    field.dataFormat = '';
                    field.checkItem = '';
                    field.dict = '';
                    field.extField = row[4];
                    field.valExp = '';
                    this.fields.push(field);
                    count++;
                }
            }
            if (db != null) {
                var fields = db.split('|');
                fields.forEach(f => {
                    if (f != '') {
                        var enname = f.split('(')[0];
                        var cnname = f.split('(')[1].split(')')[0];
                        var dataType = f.split('(')[1].split(')')[1] == 'CHAR' ? 'STR' : 'NUM';
                        var length = dataType == 'STR' ? (f.split('(')[2].split(')')[0]) : '18';

                        let field = new ESBFiled();
                        field.fieldType = type;
                        field.seriaNum = count;
                        field.field = '/root/resp/db[i]/' + enname;
                        field.fieldNm = cnname;
                        field.dataType = dataType;
                        field.Length = length;
                        field.condition = '';
                        field.valueNeeded = '是';
                        field.dataFormat = '';
                        field.checkItem = '';
                        field.dict = '';
                        field.extField = '';
                        field.valExp = '';
                        this.fields.push(field);
                        count++;
                    }
                });
            }
        }
    }

    public fields: any[] = [];

=======
import { ESBFiled } from "./esbField";
import { FieldType } from "../Enums";

export class TransInfo<T> implements ITransInfo {

    public init(transInfo: ITransInfo) {
        this.transCode = transInfo.transCode;
        this.transCtph = transInfo.transCtph;
        this.transCtra = transInfo.transCtra;
        this.transName = transInfo.transName;
        this.transPro = transInfo.transPro;
        this.transSece = transInfo.transSece;
        this.transUser = transInfo.transUser;
    }

    public transCode: string;
    public transName: string;
    public transCtph: string;
    public transCtra: string;
    public transPro: string;
    public transSece: string;
    public transUser: string;

    private type: T;

    private get IsESBTrans() {
        return true;
    }

    public dataResolve(data: any) {
        let type = FieldType.Req;
        let isJump = false;
        let count = 1;
        if (this.IsESBTrans) {
            this.transName = data[3][2];
            this.transSece = data[4][2];
            for (let row of data) {
                if (isJump) {
                    isJump = false;
                    continue;
                }
                row = row.filter(c => c != '');
                if (row.length == 1) {
                    if (row[0] == `[请求报文]`) {
                        type = FieldType.Req;
                        isJump = true;
                        count = 1;
                    } else if (row[0] == `[响应报文]`) {
                        type = FieldType.Resp;
                        isJump = true;
                        count = 1;
                    }
                }
                if (row.length >= 6) {
                    let field = new ESBFiled();
                    field.fieldType = type;
                    field.seriaNum = count;
                    field.field = row[2];
                    field.fieldNm = row[1];
                    field.dataType = row[3] == 'N' ? 'NUM' : 'STR';
                    field.minLen = field.maxLen = row[4];
                    field.condition = row.length > 6 ? row[6] : '';
                    field.valueNeeded = row[5] == 'M' ? '是' : '否';
                    field.dataFormat = '';
                    field.checkItem = '';
                    field.dict = '';
                    field.extField = '';
                    field.valExp = '';
                    this.fields.push(field);
                    count++;
                }
            }
        }
    }

    public fields: any[] = [];

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}