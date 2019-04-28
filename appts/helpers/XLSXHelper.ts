import xlsx from 'node-xlsx';
import { TransInfo } from '../models/transInfo';
import { Entry } from '../Entry';
import { ESBFiled } from '../models/esbField';

export class XLSXHelper {

    public static convertFields<T>(transInfo: ITransInfo): TransInfo<T> {
        let content = xlsx.parse(Entry.rootdir + '/tmp/cupsdata.xls');
        let data = content.find(c => c.name.trim() == transInfo.transCode).data;
        let tran = new TransInfo<T>();
        tran.init(transInfo);
        tran.dataResolve(data);
        return tran;
    }

}