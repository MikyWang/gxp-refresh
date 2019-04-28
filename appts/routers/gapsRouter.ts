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

}