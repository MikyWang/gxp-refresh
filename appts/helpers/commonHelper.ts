import * as fs from 'fs';
import * as iconvLite from 'iconv-lite';
import { Entry } from '../Entry';

export class CommonHelper {

    public static GET_LAST_RECORD: string = `select * from (select trandate||','||trim(businum)||','||trim(tabname)||','||trim(tellerseqno)||','||trim(msgid) from upss_whsh_ls  order by businum desc) where rownum=1;\n`;
    public static GET_SPEC_RECORD: string = `select trandate||','||trim(businum)||','||trim(tabname)||','||trim(tellerseqno)||','||trim(msgid) from upss_whsh_ls where businum='{0}' or msgid='{0}' or tellerseqno='{0}';\n`;

    public static GET_LOG_FILE_LIST: string = `cd ~/log/{0}&&grep -lr {1} *`;

    public static GET_LINKED_GXPIP: string = `select trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n exit\n`;

    public static GET_SEVERAL_RECORD: string = `select {0} from (select * from {1} order by businum desc) where rownum <={2};\n`;

    public static SEND_TRANS: string = `~/bin/SDSsimcli SDSsvr1 {0} ~/tmp/{1} ~/tmp/{2}\n exit\n`;

    public static BuildLog(msg: string): string {
        console.log(msg);
        return `<xmp style="word-break: break-all;white-space: pre-wrap;">` + msg + `</xmp>`
    }

    public static Random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static GetObjType(obj: any): ObjType {
        let type = Object.prototype.toString.call(obj);
        switch (type) {
            case '[object Number]':
                return ObjType.number;
            case '[object String]':
                return ObjType.string;
            case '[object Boolean]':
                return ObjType.bool;
            case '[object Object]':
                return ObjType.object;
            case '[object Array]':
                return ObjType.array;
        }
    }

    public static async ReadGBKFile(fileName: string): Promise<string> {
        let promise = new Promise<string>((resolve) => {
            fs.readFile(fileName, (err, data) => {
                if (err) resolve("ERROR");
                let content = iconvLite.decode(data, 'gbk');
                resolve(content);
            })
        });
        return promise;
    }

    public static WriteGBKFile(fileName: string, data: string) {
        let content = iconvLite.encode(data, 'gbk');
        fs.writeFileSync(fileName, content);
    }

    public static async XmlFile2Object(fileName: string): Promise<any> {
        let data = fs.readFileSync(fileName, "utf8");
        console.log(data);
        let promise = new Promise<any>(resolve => {
            Entry.entry.xmlParser.parseString(data, (err, result) => {
                if (err) resolve("ERROR");
                resolve(result);
            });
        });
        return promise;
    }

    public static BuildSQL(msg: string): string {
        const strArray = [];
        strArray.push('set heading off;\n');
        strArray.push('set line 2000;\n');
        strArray.push(msg);
        strArray.push('exit\n');
        return strArray.join('');
    }

    public static FormatString(str: string, ...params: string[]) {
        const reg = /{(\d+)}/gm;
        return str.replace(reg, (match, index) => {
            return params[index];
        });
    }

    public static RebulidOption(source: IOption, target: IOption): IOption {
        source.cmdFile = target.cmdFile || '';
        source.cmdResult += target.cmdResult;
        if (!source.data) source.data = [];
        source.data.push.apply(source.data, target.data);
        source.iOracledb = target.iOracledb || null;
        return source;
    }
}

export enum ObjType {
    number,
    string,
    bool,
    object,
    array
}

