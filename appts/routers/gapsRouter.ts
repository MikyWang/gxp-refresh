import { LinkRouter } from "./linkRouter";
import { Entry } from "../Entry";
import { ItemList, GroupItem } from "../models/itemList";
import { NextFunction, Request, Response } from '~express/lib/express';
import { GapsHelper } from "../helpers/gapsHelper";
import { GXPHelper } from "../helpers/gxpHelper";

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
            resp.cookie("cnapslist", Entry.entry.GapsEnvs);
            let IPList = new ItemList('二代环境', false, 'chooseIP', 'IP-header');
            Entry.entry.GapsEnvs.forEach(env => {
                IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGaps.enname ? true : false));
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
                linkedInfo: Entry.entry.GapsEnvs
            });
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