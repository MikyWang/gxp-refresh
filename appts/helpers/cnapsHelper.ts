import { CnapsRecord } from "../models/cnapsRecord";
import { GapsEnv } from "../models/gapsEnv";
import { CommonHelper } from "./commonHelper";
import { GapsHelper } from "./gapsHelper";
import { CoreSts, CnapsTable } from "../Enums";
import { Entry } from "../Entry";

export class CnapsHelper {

    public static async queryRecords(cnaps: GapsEnv, table: string, counts: number): Promise<CnapsRecord[]> {
        let fileds = new CnapsRecord().getFields();
        switch (table) {
            case CnapsTable.HVPS_EXCHANGE_R:
                fileds = fileds.filter(filed => filed != 'channelseq');
                break;
            case CnapsTable.BEPS_NOR_CREDIT_S:
            case CnapsTable.BEPS_NOR_CREDIT_R:
                fileds = fileds.filter(filed => filed != 'respcode' && filed != 'respmsg');
                fileds.push('trrespcode');
                fileds.push('trrespmsg');
                break;
            case CnapsTable.HVPS_RTS:
                fileds = fileds.filter(filed => filed != 'addword');
                fileds.push('ps');
                break;
            default:
                break;
        }
        const sql = CommonHelper.FormatString(CommonHelper.GET_SEVERAL_RECORD, fileds.join("||','||"), table, counts.toString());
        let option = await GapsHelper.sendCmdFile(cnaps, CommonHelper.BuildSQL(sql));
        let optionF = await cnaps.ExecSql(option.cmdFile);
        option = CommonHelper.RebulidOption(option, optionF);
        const cnapsRecords: CnapsRecord[] = [];
        if (option.data) {
            let fields = option.data.join().split('\n');
            fields.forEach(field => {
                const datas = field.split(',');
                if (datas.length > 1) {
                    const cnapsRecord = new CnapsRecord();
                    fileds.forEach((prop, index) => {
                        cnapsRecord[prop] = datas[index].trim();
                    })
                    cnapsRecord.corebksts = cnapsRecord.corebksts + '-' + CoreSts[cnapsRecord.corebksts];
                    cnapsRecord.trstatus = cnapsRecord.trstatus + '-' + Entry.entry.CnapsStatus.get(cnapsRecord.trstatus);
                    cnapsRecords.push(cnapsRecord);
                }
            })
        }
        return cnapsRecords;
    }

}