<<<<<<< HEAD
import * as uuid from 'node-uuid';
import * as fs from "fs";
import { GapsEnv } from '../models/gapsEnv';
import { GapsHelper } from '../helpers/gapsHelper';
import { GXPHelper } from '../helpers/gxpHelper';
import { INIHelper } from '../helpers/INIHelper';
import { LinkRouter } from './linkRouter';
import { NextFunction, Request, Response } from '~express/lib/express';
import { ESBHelper } from '../helpers/ESBHelper';
import { XLSXHelper } from '../helpers/XLSXHelper';
import { ESBFiled } from '../models/esbField';
import { DXZPTpye, SFTPType } from '../Enums';
import { SshClientP } from '../models/sshClientP';
import { CnapsLog } from '../models/cnapsLog';
import { CommonHelper, ObjType } from '../helpers/commonHelper';
import { CnapsRecord } from '../models/cnapsRecord';
import { FormData } from '../models/itemList';
import { UServer } from "../models/server";
import { Entry } from '../Entry';
import { NormalPay } from '../models/normalPay';

export class TestRouter extends LinkRouter {
    constructor() {
        super();
        this.link = '/test';
    }

    initPath(): any {
        this.router.get('/INITest', (req: Request, res: Response, next: NextFunction) => {
            let dir = '/test.ini';
            let ini = INIHelper.parser(dir);
            let message = '';
            ini.forEach(sc => {
                message += sc.name + '\n';
                sc.value.forEach(map => {
                    message += map.key + ":" + map.value + '\n';
                })
            });
            res.render('test', { message: message });
        });
        this.router.get('/changeIPTest', async (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.cnapenv;
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true, 'gaps', 'gaps');
            let option: IOption = { cmdResult: '' };
            let db = (await gapsEnv.getDBConfig()).iOracledb;
            let message = '测试结果' + db.dbName + '\n' + db.password + '\n' + db.user + '\n';
            message += option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/restartGaps', async (req: Request, res: Response, next: NextFunction) => {
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true, 'gaps', 'gaps');
            let option: IOption = { cmdResult: '' };
            option = await gapsEnv.restartService();
            let message = option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/getGxpLink', async (req: Request, res: Response, next: NextFunction) => {
            let gapsEnv = GapsHelper.currentGaps('cnaps32') as GapsEnv;
            let currentGxp = GXPHelper.CurrentGxp('verFOUR');
            let option = await gapsEnv.connectGXP(currentGxp);
            let message = option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/testTC', async (req: Request, res: Response, next: NextFunction) => {
            const cnapsRecord = new CnapsRecord();
            const fields = cnapsRecord.getFields();
            res.render('test', { message: fields });
        });

        this.router.get('/testsheet', async (req: Request, res: Response, next: NextFunction) => {
            let code = req.query.code;
            let id = uuid.v1();
            let transInfo: ITransInfo = {
                transCode: code,
                transName: '',
                transCtph: '17321092986',
                transCtra: '王齐源',
                transPro: 'GAPS',
                transSece: '',
                transUser: '',
            }
            let result = XLSXHelper.convertFields<ESBFiled>(transInfo);
            const file = ESBHelper.getWorkBook(id);
            ESBHelper.addRecordSheet(file, '王齐源');
            ESBHelper.addRuleSheet(file);
            ESBHelper.addDescSheet(file, result);
            const sheet = ESBHelper.addInterfaceSheet(file, result.fields);
            ESBHelper.addFileSheet(file);
            const msg = await ESBHelper.resolveFile(file);
            res.download(msg);
        });

        this.router.get('/testxlsx', (req: Request, res: Response, next: NextFunction) => {

            let transInfo: ITransInfo = {
                transCode: '3037',
                transName: '',
                transCtph: '17321092986',
                transCtra: '王齐源',
                transPro: 'GAPS',
                transSece: '',
                transUser: '',
            }

            let result = XLSXHelper.convertFields<ESBFiled>(transInfo);
            res.json(result);
        });

        this.router.get('/testDXZP', async (req: Request, res: Response, next: NextFunction) => {
            let info: IDXZPInfo = {
                account: '280600000246516',
                name: '月才子'
            }
            let currentGaps = GapsHelper.currentGaps('gapszsc');
            let option = await currentGaps.addDXZP(DXZPTpye.black, 'acct', info);
            res.render('test', { message: option.cmdResult });
        })

        this.router.get('/testSSHP', async (req: Request, res: Response, next: NextFunction) => {
            let currentGaps = GapsHelper.currentGaps('cnaps39');
            let cnapsRec = new CnapsLog(currentGaps);
            let option = await cnapsRec.queryRecord();
            console.log(cnapsRec);
            const optionF = await cnapsRec.getLogList();
            option = CommonHelper.RebulidOption(option, optionF);
            res.render('test', { message: option.data.join('') });
        });

        this.router.get('/cnaps', async (req: Request, res: Response, next: NextFunction) => {
            var cnapsList = Entry.entry.GapsEnvs.filter(env => env.cnapsFlag);
            var listOptions = [];
            var transOptions = [];
            cnapsList.forEach(cnaps => {
                listOptions.push({
                    value: cnaps.ip,
                    name: cnaps.name + ` - ` + cnaps.ip
                });
            });
            var list = fs.readdirSync(Entry.rootdir + '/simtrans');
            list.forEach(name => {
                transOptions.push({ value: name, name: name });
            });
            let data = await CommonHelper.ReadGBKFile(Entry.rootdir + '/simtrans/' + list[0]);
            let formdatas = [
                new FormData("env", "选择环境", "select", listOptions, false),
                new FormData('trans', '选择交易', "select", transOptions, false),
                new FormData('request', "请求", 'textarea', data, false),
                // new FormData('response', '响应', 'textarea', '', true)
            ];
            // let data = await CommonHelper.XmlFile2Object(Entry.rootdir + '/simtrans/' + list[0]);
            // res.cookie("data", data);
            // let getKey = (parent, data) => {
            //     for (let key in data) {
            //         let name = parent;
            //         if (!(key == '0')) name += '/' + key;
            //         let type = CommonHelper.GetObjType(data);
            //         if (type == ObjType.object) {
            //             getKey(name, data[key]);
            //         } else {
            //             type = CommonHelper.GetObjType(data[key]);
            //             if (type == ObjType.object || type == ObjType.array) {
            //                 getKey(name, data[key]);
            //             } else {
            //                 formdatas.push(new FormData(name, name, 'input', data[key], false));
            //             }
            //         }
            //     }
            // };

            // let getkey = (key, data) => {
            //     let type = CommonHelper.GetObjType(data);
            //     if (type != ObjType.array && type != ObjType.object) {
            //         formdatas.push(new FormData(key, key, 'input', data, false));
            //     } else {
            //         for (let key in data) {
            //             if (key != '0')
            //                 formdatas.push(new FormData(key, key, '', '', true));
            //             getkey(key, data[key]);
            //         }
            //     }
            // };

            res.render('test', { form: { title: '二代报文发送', data: formdatas } });
        });
        this.router.post('/sendtrans', async (req: Request, res: Response, next: NextFunction) => {
            let data: ITransRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(data.env);
            CommonHelper.WriteGBKFile(Entry.rootdir + '/simtrans/' + data.trans, data.request);
            let option = await currentGaps.SendTrans(data.trans);
            res.json(option.cmdResult);
        });
        this.router.get('/gettrans', async (req: Request, res: Response, next: NextFunction) => {
            let trans = req.query.trans;
            let data = await CommonHelper.ReadGBKFile(Entry.rootdir + '/simtrans/' + trans);
            res.json(data);
        });
        this.router.get('/testts', async (req: Request, res: Response, next: NextFunction) => {
            let body = await CommonHelper.XmlFile2Object(Entry.rootdir + '/simtrans/700301_电子渠道往帐支付.xml');
            console.log(body);
            let data = new NormalPay('hvps');
            res.json(data);
        });

        this.router.get('/gapstrans', async (req: Request, res: Response, next: NextFunction) => {
            var gapsList = Entry.entry.GapsEnvs.filter(env => !env.cnapsFlag);
            var listOptions = [];
            var transOptions = [];
            var sysOptions = [];
            gapsList.forEach(g => {
                listOptions.push({
                    value: g.ip,
                    name: g.name + ` - ` + g.ip
                });
            });
            var list = fs.readdirSync(Entry.rootdir + '/gapstrans');
            list.forEach(name => {
                transOptions.push({ value: name, name: name });
            });
            let data = await CommonHelper.ReadGBKFile(Entry.rootdir + '/gapstrans/' + list[0]);
            let gapsSys = Entry.entry.GapsSys;
            gapsSys.forEach((key, value) => {
                sysOptions.push({ value: value, name: value + '-' + key });
            });
            let formdatas = [
                new FormData("env", "选择环境", "select", listOptions, false),
                new FormData('sys', '选择接入子系统', "select", sysOptions, false),
                new FormData('trans', '选择交易', "select", transOptions, false),
                new FormData('request', "请求", 'textarea', data, false),
                new FormData('response', '响应', 'textarea', '', true)
            ];
            res.render('gapstrans', {
                title: "GAPS报文发送",
                navbarIndex: "8",
                form: { title: '自定义报文添加及发送', data: formdatas }
            });
        });
    }
=======
import * as uuid from 'node-uuid';
import { GapsEnv } from '../models/gapsEnv';
import { GapsHelper } from '../helpers/gapsHelper';
import { GXPHelper } from '../helpers/gxpHelper';
import { INIHelper } from '../helpers/INIHelper';
import { LinkRouter } from './linkRouter';
import { NextFunction, Request, Response } from '~express/lib/express';
import { ESBHelper } from '../helpers/ESBHelper';
import { XLSXHelper } from '../helpers/XLSXHelper';
import { ESBFiled } from '../models/esbField';
import { DXZPTpye } from '../Enums';

export class TestRouter extends LinkRouter {
    constructor() {
        super();
        this.link = '/test';
    }

    initPath(): any {
        this.router.get('/INITest', (req: Request, res: Response, next: NextFunction) => {
            let dir = '/test.ini';
            let ini = INIHelper.parser(dir);
            let message = '';
            ini.forEach(sc => {
                message += sc.name + '\n';
                sc.value.forEach(map => {
                    message += map.key + ":" + map.value + '\n';
                })
            });
            res.render('test', { message: message });
        });
        this.router.get('/changeIPTest', async (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.cnapenv;
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true, 'gaps', 'gaps');
            let option: IOption = { cmdResult: '' };
            let db = await gapsEnv.getDBConfig(option);
            let message = '测试结果' + db.dbName + '\n' + db.password + '\n' + db.user + '\n';
            message += option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/restartGaps', async (req: Request, res: Response, next: NextFunction) => {
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true, 'gaps', 'gaps');
            let option: IOption = { cmdResult: '' };
            await gapsEnv.restartService(option);
            let message = option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/getGxpLink', async (req: Request, res: Response, next: NextFunction) => {
            let gapsEnv = GapsHelper.currentGaps('cnaps32') as GapsEnv;
            let currentGxp = GXPHelper.CurrentGxp('verFOUR');
            let option = await gapsEnv.connectGXP(currentGxp);
            let message = option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/testTC', async (req: Request, res: Response, next: NextFunction) => {
            let currentGaps = GapsHelper.currentGaps('cnaps32');
            let option = await currentGaps.changeTCConfig('verFOUR', currentGaps.tcIPs[0]);
            res.render('test', { message: option.cmdResult });
        });

        this.router.get('/testsheet', async (req: Request, res: Response, next: NextFunction) => {
            let code = req.query.code;
            let id = uuid.v1();
            let transInfo: ITransInfo = {
                transCode: code,
                transName: '',
                transCtph: '17321092986',
                transCtra: '王齐源',
                transPro: 'GAPS',
                transSece: '',
                transUser: '',
            }
            let result = XLSXHelper.convertFields<ESBFiled>(transInfo);
            const file = ESBHelper.getWorkBook(id);
            ESBHelper.addRecordSheet(file, '王齐源');
            ESBHelper.addRuleSheet(file);
            ESBHelper.addDescSheet(file, result);
            const sheet = ESBHelper.addInterfaceSheet(file, result.fields);
            ESBHelper.addFileSheet(file);
            const msg = await ESBHelper.resolveFile(file);
            res.download(msg);
        });

        this.router.get('/testxlsx', (req: Request, res: Response, next: NextFunction) => {

            let transInfo: ITransInfo = {
                transCode: '3037',
                transName: '',
                transCtph: '17321092986',
                transCtra: '王齐源',
                transPro: 'GAPS',
                transSece: '',
                transUser: '',
            }

            let result = XLSXHelper.convertFields<ESBFiled>(transInfo);
            res.json(result);
        });

        this.router.get('/testDXZP', async (req: Request, res: Response, next: NextFunction) => {
            let info: IDXZPInfo = {
                account: '280600000246516',
                name: '月才子'
            }
            let currentGaps = GapsHelper.currentGaps('gapszsc');
            let option = await currentGaps.addDXZP(DXZPTpye.black, 'acct', info);
            res.render('test', { message: option.cmdResult });
        })
    }
>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}