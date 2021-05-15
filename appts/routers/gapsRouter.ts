<<<<<<< HEAD
import { LinkRouter } from "./linkRouter";
import { Entry } from "../Entry";
import { ItemList, GroupItem, FormData } from "../models/itemList";
import { NextFunction, Request, Response } from '~express/lib/express';
import { GapsHelper } from "../helpers/gapsHelper";
import { GXPHelper } from "../helpers/gxpHelper";
import { DXZPTpye } from "../Enums";
import { CnapsHelper } from "../helpers/cnapsHelper";
import { CommonHelper } from "../helpers/commonHelper";
import * as fs from 'fs';
import { NormalPay } from "../models/normalPay";

export class GapsRouter extends LinkRouter {

    constructor() {
        super();
        this.link = '/gaps';
    }

    initPath(): any {

        this.router.get('/restart-gaps', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(enname);
            const option = await currentGaps.restartService();
            resp.json(option);
        });

        this.router.get('/restart-comm', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(enname);
            const option = await currentGaps.restartComm();
            resp.json(option);
        });

        this.router.get('/cnaps-manager', (req: Request, resp: Response, next: NextFunction) => {
            const cnapsList = Entry.entry.GapsEnvs.filter(ge => ge.cnapsFlag);
            resp.cookie("cnapslist", cnapsList);
            let cnapsPanels: ICnapsPanel[] = [];
            cnapsList.forEach(cnaps => {
                const env: ICnapsPanel = GapsHelper.getSubmitInfo(cnaps);
                env.ip = cnaps.ip;
                env.name = cnaps.name;
                env.enname = cnaps.enname;
                env.gxpName = GXPHelper.CurrentGxp(env.gxpIP).name;
                cnapsPanels.push(env);
            });
            resp.render('cnapsManager', {
                title: "二代环境修改登记",
                navbarIndex: "3",
                cnapsPanels: cnapsPanels,
                GxpIPs: Entry.entry.gxpIPs,
            });
        })

        this.router.get('/cnaps-sim', async (req: Request, resp: Response, next: NextFunction) => {
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
                new FormData('response', '响应', 'textarea', '', true)
            ];
            let pay = new NormalPay('hvps');
            let payDatas = [
                new FormData("payenv", "选择环境", "select", listOptions, false),
                new FormData('paytrans', '选择交易', "select", [{ value: 'hvps', name: '大额普通贷记往帐' }, { value: 'beps', name: '小额普通贷记往帐' }], false),
                new FormData('channelid', '交易渠道', 'input', pay.pub.channelid, false),
                new FormData('channelseq', '渠道流水号', 'input', pay.pub.channelseq, true),
                new FormData('payeraccno', '付款人账号', 'input', pay.hupp.payeraccno, false),
                new FormData('payername', '付款人姓名', 'input', pay.hupp.payername, false),
                new FormData('rcveraccno', '收款人账号', 'input', pay.hupp.rcveraccno, false),
                new FormData('rcvername', '收款人姓名', 'input', pay.hupp.rcvername, false),
                new FormData('rcverbkid', '收款人开户行号', 'input', pay.hupp.rcverbkid, false),
                new FormData('rcverbknm', '收款人开户行名', 'input', pay.hupp.rcverbknm, false),
                new FormData('rcverbknm', '收款人开户行名', 'input', pay.hupp.rcverbknm, false),
                new FormData('amt', '交易金额', 'input', pay.hupp.amt, false),
                new FormData('txtpcd', '业务类型', 'input', pay.hupp.txtpcd, false),
                new FormData('txctgypurpcd', '业务种类', 'input', pay.hupp.txctgypurpcd, false),
                new FormData('recvbkid', '接收行号', 'input', pay.hupp.recvbkid, false),
                new FormData('transdep', '交易机构', 'input', pay.pub.transdep, false),
                new FormData('operator', '交易柜员', 'input', pay.pub.operator, false),
                new FormData('termnum', '终端号', 'input', pay.pub.termnum, false),
                new FormData('auther', '授权柜员', 'input', pay.pub.auther, false),
                new FormData('ps', '备注', 'input', pay.hupp.ps, false),
                new FormData('addword', '附言', 'input', pay.hupp.addword, false),
                new FormData('payresponse', '响应', 'textarea', '', true)
            ];
            resp.render('cnapsSim', {
                title: "二代报文发送",
                navbarIndex: "6",
                payForm: { title: '配置交易发送', data: payDatas },
                form: { title: '自定义报文添加及发送', data: formdatas }
            });
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

        this.router.post('/sendtrans', async (req: Request, res: Response, next: NextFunction) => {
            let data: ITransRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(data.env);
            CommonHelper.WriteGBKFile(Entry.rootdir + '/simtrans/' + data.trans, data.request);
            let option = await currentGaps.SendTrans('simtrans/' + data.trans);
            res.json(option);
        });
        this.router.post('/sendgapstrans', async (req: Request, res: Response, next: NextFunction) => {
            let data: ITransRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(data.env);
            CommonHelper.WriteGBKFile(Entry.rootdir + '/gapstrans/' + data.trans, data.request);
            let option = await currentGaps.SendTrans('gapstrans/' + data.trans, data.sys);
            res.json(option);
        });
        this.router.post('/sendnormaltrans', async (req: Request, res: Response, next: NextFunction) => {
            let env = req.query.env;
            let content = req.query.data;
            let data: NormalPay = JSON.parse(content);
            let currentGaps = GapsHelper.currentGaps(env);
            NormalPay.prototype.Save.call(data);
            let trans = Entry.entry.xmlBuilder.buildObject(data);
            let file = GapsHelper.genCmdFileName();
            CommonHelper.WriteGBKFile(Entry.rootdir + '/tmp/' + file, trans);
            let option = await currentGaps.SendTrans('tmp/' + file);
            res.json(option);
        });
        this.router.get('/gettrans', async (req: Request, res: Response, next: NextFunction) => {
            let trans = req.query.trans;
            let data = await CommonHelper.ReadGBKFile(Entry.rootdir + '/simtrans/' + trans);
            res.json(data);
        });
        this.router.get('/getgapstrans', async (req: Request, res: Response, next: NextFunction) => {
            let trans = req.query.trans;
            let data = await CommonHelper.ReadGBKFile(Entry.rootdir + '/gapstrans/' + trans);
            res.json(data);
        });
        this.router.get('/getnormaltrans', async (req: Request, res: Response, next: NextFunction) => {
            let type = req.query.type;
            let data = new NormalPay(type);
            res.json(data);
        });
        this.router.get('/import', async (req: Request, res: Response, next: NextFunction) => {
            res.render('importTrans');
        });

        this.router.post('/uploadtrans', async (req: Request, res: Response, next: NextFunction) => {
            let data: ITransRequest = (req as any).body;
            CommonHelper.WriteGBKFile(Entry.rootdir + '/simtrans/' + data.trans, data.request);
            res.json('上传成功!');
        });
        this.router.post('/uploadgapstrans', async (req: Request, res: Response, next: NextFunction) => {
            let data: ITransRequest = (req as any).body;
            CommonHelper.WriteGBKFile(Entry.rootdir + '/gapstrans/' + data.trans, data.request);
            res.json('上传成功!');
        });

        this.router.post('/queryRecords', async (req: Request, resp: Response, next: NextFunction) => {
            const param = req.query.envName;
            const currentGaps = GapsHelper.currentGaps(param);
            let info: ICnapsRecordRequest = (req as any).body;
            info.counts = 10;
            if (info.businum && info.businum != '') {
                info.counts = 1;
            }
            const cnapsRecords = await CnapsHelper.queryRecords(currentGaps, info.tableName, info.counts);
            resp.render('recordTable', {
                tbodys: cnapsRecords
            });

        });
        this.router.get('/cnaps-records', async (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            const IPList = GapsHelper.CnapsList(currentGaps.enname);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("cnapslist", Entry.entry.GapsEnvs.filter(env => env.cnapsFlag));
            resp.render('cnapsRecord', {
                title: "二代流水查询",
                navbarIndex: "5",
                IPList: IPList,
                GxpIPs: Entry.entry.gxpIPs,
            });
        })

        this.router.get('/cnaps-logs', (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("gxpFlag", false);
            resp.cookie("cnapslist", Entry.entry.GapsEnvs.filter(env => env.cnapsFlag));
            const IPList = GapsHelper.CnapsList(currentGaps.enname);
            resp.render('cnapsLogs', {
                title: "二代来往帐日志快速定位",
                IPList: IPList,
                navbarIndex: "6",

            });
        });
        this.router.get('/dxzp', (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("gxpFlag", false);
            resp.cookie("gapslist", Entry.entry.GapsEnvs.filter(env => !env.cnapsFlag));
            let IPList = new ItemList('GAPS环境', false, 'chooseIP', 'IP-header');
            Entry.entry.GapsEnvs.forEach(env => {
                if (!env.cnapsFlag) {
                    IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGaps.enname ? true : false));
                }
            });
            let formDatas = [
                new FormData('cardtype', '号码类型', 'select', [{ value: 'acct', name: '账号' }, { value: 'id', name: '身份证' }], false)
                , new FormData('mddata', '维护号码', 'input', '', false)
                , new FormData('bustype', '维护类型', 'select', [{ value: 'black', name: '黑名单' }, { value: 'gray', name: '灰名单' }], false)
                , new FormData('mdname', '户名', 'input', '', false)];
            resp.render('dxzp', {
                title: "电信诈骗黑灰名单维护",
                IPList: IPList,
                navbarIndex: "4",
                form: { title: '黑灰名单维护', data: formDatas }
            });
        });

        this.router.post('/submitDxzp', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let info: IDXZPRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(enname);
            let option = await currentGaps.addDXZP(DXZPTpye[info.busType], info.cardType, { account: info.mdData, name: info.mdName });
            resp.json(option);
        });

        this.router.post('/deleteDxzp', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let info: IDXZPRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(enname);
            let option = await currentGaps.deleteDXZP(DXZPTpye[info.busType], info.cardType, { account: info.mdData, name: info.mdName });
            resp.json(option);
        });

        this.router.post('/deleteAllDxzp', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let info: IDXZPRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(enname);
            let option = await currentGaps.deleteDXZP(DXZPTpye[info.busType]);
            resp.json(option);
        });

        this.router.get('/getGxpIP', async (req: Request, resp: Response, next: NextFunction) => {
            this.addAllowOrigin(resp);
            let param = req.query.enname;
            let currentGaps = GapsHelper.currentGaps(param);
            let orgGxpIP = (await currentGaps.getGxpIP()).data.join('');
            let orgGxp = GXPHelper.CurrentGxp(orgGxpIP.trim().replace('\n', ''));
            resp.json({ orgGxpIP: orgGxp.ip });
        });
        this.router.get('/switchlog', async (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.enname;
            let itemList = new ItemList('日志名', false, 'chooseLog', 'Log-header');
            itemList.groupItems.push(new GroupItem('TEST1', true), new GroupItem('TEST2', false));
            let reqc: any = req;
            let params = reqc.cookies['envname'];
            let currentGaps = GapsHelper.currentGaps(params);
            let option = await GapsHelper.GetLogNames(currentGaps);
            let log: ILog = { data: option.cmdResult, ready: false };
            resp.render('includes/switchbar', { itemList: itemList, log: log });
        });
        this.router.post('/submitCnaps', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let gxpIP = (req as any).body.gxpIP;
            let currentGaps = GapsHelper.currentGaps(enname);
            let env = GapsHelper.getSubmitInfo(currentGaps);
            env.gxpIP = gxpIP;
            GapsHelper.saveSubmitInfo(enname, env);
            let CurrentGxp = GXPHelper.CurrentGxp(gxpIP);
            let option = await GapsHelper.RefreshCnaps(currentGaps, CurrentGxp);
            resp.json(option);
        });

    }

=======
import { LinkRouter } from "./linkRouter";
import { Entry } from "../Entry";
import { ItemList, GroupItem, FormData } from "../models/itemList";
import { NextFunction, Request, Response } from '~express/lib/express';
import { GapsHelper } from "../helpers/gapsHelper";
import { GXPHelper } from "../helpers/gxpHelper";
import { DXZPTpye } from "../Enums";

export class GapsRouter extends LinkRouter {

    constructor() {
        super();
        this.link = '/gaps';
    }

    initPath(): any {
        this.router.get('/cnaps-modify', (req: Request, resp: Response, next: NextFunction) => {
            let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("gxpFlag", true);
            resp.cookie("cnapslist", Entry.entry.GapsEnvs.filter(env => env.cnapsFlag));
            let IPList = new ItemList('二代环境', false, 'chooseIP', 'IP-header');
            Entry.entry.GapsEnvs.forEach(env => {
                if (env.cnapsFlag) {
                    IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGaps.enname ? true : false));
                }
            });
            let env: ICnapsPanel = GapsHelper.getSubmitInfo(currentGaps);
            env.clientIP = clientIP;
            resp.render('cnapsModify', {
                title: "二代环境修改登记",
                IPList: IPList,
                serviceIP: currentGaps.ip,
                env: env,
                navbarIndex: "3",
                GxpIPs: Entry.entry.gxpIPs,
                linkedInfo: Entry.entry.GapsEnvs.filter(ge => ge.cnapsFlag)
            });
        });
        this.router.get('/cnaps-logs', (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("gxpFlag", false);
            resp.cookie("cnapslist", Entry.entry.GapsEnvs.filter(env => env.cnapsFlag));
            let IPList = new ItemList('二代环境', false, 'chooseIP', 'IP-header');
            Entry.entry.GapsEnvs.forEach(env => {
                if (env.cnapsFlag) {
                    IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGaps.enname ? true : false));
                }
            });
            resp.render('cnapsLogs', {
                title: "二代来往帐日志快速定位",
                IPList: IPList,
                navbarIndex: "5",

            });
        });
        this.router.get('/dxzp', (req: Request, resp: Response, next: NextFunction) => {
            let param = req.query.envName;
            let currentGaps = GapsHelper.currentGaps(param);
            resp.cookie("envname", currentGaps.enname);
            resp.cookie("gxpFlag", false);
            resp.cookie("gapslist", Entry.entry.GapsEnvs.filter(env => !env.cnapsFlag));
            let IPList = new ItemList('GAPS环境', false, 'chooseIP', 'IP-header');
            Entry.entry.GapsEnvs.forEach(env => {
                if (!env.cnapsFlag) {
                    IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGaps.enname ? true : false));
                }
            });
            let formDatas = [
                new FormData('cardtype', '号码类型', 'select', [{ value: 'acct', name: '账号' }, { value: 'id', name: '身份证' }], false)
                , new FormData('mddata', '维护号码', 'input', '', false)
                , new FormData('bustype', '维护类型', 'select', [{ value: 'black', name: '黑名单' }, { value: 'gray', name: '灰名单' }], false)
                , new FormData('mdname', '户名', 'input', '', false)];
            resp.render('dxzp', {
                title: "电信诈骗黑灰名单维护",
                IPList: IPList,
                navbarIndex: "4",
                form: { title: '黑灰名单维护', data: formDatas }
            });
        });

        this.router.post('/submitDxzp', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let info: IDXZPRequest = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(enname);
            let option = await currentGaps.addDXZP(DXZPTpye[info.busType], info.cardType, { account: info.mdData, name: info.mdName });
            resp.json(option);
        });

        this.router.get('/getGxpIP', async (req: Request, resp: Response, next: NextFunction) => {
            this.addAllowOrigin(resp);
            let param = req.query.enname;
            let currentGaps = GapsHelper.currentGaps(param);
            let orgGxpIP = await currentGaps.getGxpIP();
            let orgGxp = GXPHelper.CurrentGxp(orgGxpIP.trim().replace('\n', ''));
            let env = GapsHelper.getSubmitInfo(currentGaps);
            resp.json({ orgGxpIP: orgGxp.name + '   ->   ' + orgGxp.ip, env: env });
        });
        this.router.post('/submitCnaps', async (req: Request, resp: Response, next: NextFunction) => {
            let enname = req.query.envName;
            let env: ICnapsPanel = (req as any).body;
            let currentGaps = GapsHelper.currentGaps(enname);
            let CurrentGxp = GXPHelper.CurrentGxp(env.orgGxpIP);
            GapsHelper.saveSubmitInfo(enname, env);
            let option = await GapsHelper.RefreshCnaps(currentGaps, CurrentGxp);
            resp.json(option);
        });

    }

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}