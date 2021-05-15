import { CommonHelper } from "../helpers/commonHelper";
import { GapsEnv } from "./gapsEnv";
import { GapsHelper } from "../helpers/gapsHelper";

export class CnapsLog {

    public cnapsEnv: GapsEnv;
    public trandate: string;
    public businum: string;
    public tabname: string;
    public msgid: string;
    public channelseq: string;

    public static LOG_DIR = `~/log/`;

    constructor(cnapsEnv: GapsEnv) {
        this.cnapsEnv = cnapsEnv;
    }

    public async queryRecord(param?: string): Promise<IOption> {
        const sql = (!param) ? CommonHelper.BuildSQL(CommonHelper.GET_LAST_RECORD) : CommonHelper.BuildSQL(CommonHelper.FormatString(CommonHelper.GET_SPEC_RECORD, param));
        let option = await GapsHelper.sendCmdFile(this.cnapsEnv, sql);
        let optionF = await this.cnapsEnv.ExecSql(option.cmdFile);
        option.cmdResult += optionF.cmdResult;
        if (optionF.data) {
            const field = optionF.data.join('').split(',');
            // this.trandate = field[0].trim();
            this.businum = field[1].trim();
            this.trandate = this.businum.substring(0, 8);
            this.tabname = field[2].trim();
            this.channelseq = field[3].trim();
            this.msgid = field[4].trim();
        }
        return option;
    }

    public async getLogList(): Promise<IOption> {
        if (!this.businum) return { cmdResult: '业务流水号为空!' };
        let option: IOption = { cmdResult: '' };
        if (!this.trandate) {
            option = await this.queryRecord(this.businum);
        }
        const cmd = CommonHelper.FormatString(CommonHelper.GET_LOG_FILE_LIST, this.trandate, this.businum);
        const optionF = await this.cnapsEnv.ExecCmd(cmd);

        option = CommonHelper.RebulidOption(option, optionF);
        return option;
    }

}