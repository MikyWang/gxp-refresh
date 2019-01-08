import { DeviceType } from '../Enums';
import { Entry } from '../Entry';
import { GXPHelper } from '../helpers/gxpHelper';
import { ConfigDetail, GroupItem, ItemList } from '../models/itemList';
import { LinkRouter } from './linkRouter';
import { NextFunction, Request, Response } from '~express/lib/express';

export class GxpRouter extends LinkRouter {
    constructor() {
        super();
        this.link = '/gxp';
    }
    initPath(): any {
        this.router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
            res.render('index', {
                title: "gxp环境重置",
                configs: Entry.entry.gxpIPs,
                navbarIndex: "1"
            });
        });
        this.router.post('/resolveRefresh', (req: any, res: Response, next: NextFunction) => {
            let envname = req.body.enname;
            this.addAllowOrigin(res);
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            } else {
                let options = { cmdResult: '' };
                GXPHelper.RefreshEnviroment(currentGxp, option => {
                    if (!res.headersSent) {
                        return res.json({ result: option.cmdResult });
                    }
                }, options);
            }
        });
        this.router.get('/modify', (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            res.cookie("envname", currentGxp.enname);
            res.cookie('gxpFlag', false);

            let currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);

            let configTypeItemList = new ItemList('接入接出', false, 'chooseConfig', 'type-header');
            configTypeItemList.groupItems.push(new GroupItem('ICA', true));
            configTypeItemList.groupItems.push(new GroupItem('OCA', false));

            let configItemList = GXPHelper.GetConfigDevices(currentGxp, false, DeviceType.ALL);

            let IPList = new ItemList('Gxp环境IP', false, 'chooseIP', 'IP-header');
            Entry.entry.gxpIPs.forEach(env => {
                IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == currentGxp.enname ? true : false));
            })

            let env = new ConfigDetail(currentGxpConfig.icaconf[0].ica[0].$.id, currentGxpConfig.icaconf[0].ica[0].$.ipSet ? currentGxpConfig.icaconf[0].ica[0].$.ipSet : '', currentGxpConfig.icaconf[0].ica[0].$.port, currentGxpConfig.icaconf[0].ica[0].$.flowEntry, currentGxpConfig.icaconf[0].ica[0].$.eflowEntry);

            res.render('modify', {
                title: "gxp环境参数修改",
                navbarIndex: "2",
                configTypeItemList: configTypeItemList,
                configItemList: configItemList,
                env: env,
                IPList: IPList
            });
        });

        this.router.get('/showdetail', (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }
            let configName = req.query.configName;

            let detailConfig = GXPHelper.GetDetailConfig(currentGxp, configName);

            res.render('config', {
                env: detailConfig
            });
        });

        this.router.get('/showDevice', (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            let configType = req.query.configType;

            let configItemList = GXPHelper.GetConfigDevices(currentGxp, false, DeviceType[configType]);

            res.render('device', {
                configItemList: configItemList
            });

        });

        this.router.get('/searchDevice', (req: Request, res: Response, next: NextFunction) => {
            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            let searchText = req.query.searchText;

            let configItemList = GXPHelper.GetConfigDevices(currentGxp, true, DeviceType.ALL, searchText);

            res.render('device', {
                configItemList: configItemList
            });

        });

        this.router.get('/submitDevice', (req: Request, res: Response, next: NextFunction) => {
            this.addAllowOrigin(res);
            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            let detail: any = req.query.configDetail;

            let configDetail = new ConfigDetail(detail.configId, detail.serviceIP, detail.port, detail.flow, detail.eflow);

            GXPHelper.ChangeDeviceDetail(currentGxp, configDetail);

            res.json({ result: 'success' });

        });
    }
}
