<<<<<<< HEAD
import xlsx from 'node-xlsx';
import { TransInfo } from '../models/transInfo';
import { Entry } from '../Entry';
import { ESBFiled } from '../models/esbField';
import * as fs from 'fs';

export class XLSXHelper {

    public static convertFields<T>(transInfo: ITransInfo): TransInfo<T> {
        let content = xlsx.parse(Entry.rootdir + 'tmp/test.xlsx');
        let data = content[0].data;
        let tran = new TransInfo<T>();
        tran.init(transInfo);
        tran.dataResolve(data, "businum(业务受理编号)CHAR(36)|agreeclass(协议分类)CHAR(2)|ctrctnb(合同协议号)CHAR(60)|payeraccno(付款人账号)CHAR(32)|ageetype(合同协议类型)CHAR(4)|srflg(往来帐标志)CHAR(1)|sendbkid(发起行行号)CHAR(14)|orgsnder(发起清算行行号)CHAR(14)|orgrcver(接收清算行行号)CHAR(14)|msgid(报文标识号)CHAR(35)|payername(付款人名称)CHAR(120)|paybkid(付款行行号)CHAR(14)|payerbkid(付款人开户行行号)CHAR(14)|paysttlmbkid(付款清算行行号)CHAR(14)|rcvbkid(收款行行号)CHAR(14)|rcveraccno(收款人账号)CHAR(32)|rcvername(收款人名称)CHAR(120)|authaboveamt(授权最高金额)NUMBER(18,2)|fcvflg(协议生效标志)CHAR(1)|trstatus(交易状态)CHAR(3)|provno(维护省市代码)CHAR(4)|orgno(维护机构号)CHAR(16)|inputoper(维护柜员号)CHAR(8)|inputdt(录入日期)CHAR(8)|inputtm(录入时间)CHAR(6)|sysdt(维护日期)CHAR(8)|systm(维护时间)CHAR(6)|mkinfo1(备用字段1)VARCHAR2(20)|mkinfo2(备用字段2)VARCHAR2(60)|mkinfo3(备用字段3)VARCHAR2(120)|mkinfo4(备用字段4)VARCHAR2(512)|mkinfo5(备用字段5)VARCHAR2(512)|mkinfo6(备用字段6)VARCHAR2(512)| translog (交易日志)VARCHAR2(120)|");
        data = [];
        tran.fields.forEach(t => {
            data.push(t.build());
        });
        var buffer = xlsx.build([{ name: "test", data: data }]);
        fs.writeFileSync(Entry.rootdir + 'public/gxp/res.xlsx', buffer);
        return tran;
    }

=======
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

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}