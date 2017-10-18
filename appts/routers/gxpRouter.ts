import * as http from 'http';
import { NextFunction, Request, Response } from '~express/lib/express';
import { Entry } from '../Entry';
import { DeviceType } from '../Enums';
import { GXPHelper } from '../helpers/gxpHelper';
import { ConfigDetail, GroupItem, ItemList } from '../models/itemList';
import { LinkRouter } from './linkRouter';

export class GxpRouter extends LinkRouter {
    constructor() {
        super();
        this.link = '/gxp';
    }
    public initPath(): any {
        this.router.get('/refresh', (req: Request, res: Response, next: NextFunction) => {
            res.render('index', {
                title: "gxp环境重置",
                configs: Entry.entry.gxpIPs,
                navbarIndex: "1",
            });
        });
        this.router.post('/resolveRefresh', (req: any, res: Response, next: NextFunction) => {
            const envname = req.body.enname;
            this.addAllowOrigin(res);
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            } else {
                const options = { cmdResult: '' };
                GXPHelper.RefreshEnviroment(currentGxp, (option) => {
                    if (!res.headersSent) {
                        res.json({ result: option.cmdResult });
                    }
                }, options);
            }
        });
        this.router.get('/modify', (req: Request, res: Response, next: NextFunction) => {
            const envname = req.query.envName;
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            res.cookie("envname", currentGxp.enname);

            const currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);

            const configTypeItemList = new ItemList('接入接出', false, 'chooseConfig', 'type-header');
            configTypeItemList.groupItems.push(new GroupItem('ICA', true));
            configTypeItemList.groupItems.push(new GroupItem('OCA', false));

            const configItemList = GXPHelper.GetConfigDevices(currentGxp, false, DeviceType.ALL);

            const iPList = new ItemList('Gxp环境IP', false, 'chooseIP', 'IP-header');
            Entry.entry.gxpIPs.forEach((envir) => {
                iPList.groupItems.push(new GroupItem(envir.name + ` - ` + envir.ip, envir.enname == currentGxp.enname ? true : false));
            });

            const env = new ConfigDetail(currentGxpConfig.icaconf[0].ica[0].$.id, currentGxpConfig.icaconf[0].ica[0].$.ipSet ? currentGxpConfig.icaconf[0].ica[0].$.ipSet : '', currentGxpConfig.icaconf[0].ica[0].$.port, currentGxpConfig.icaconf[0].ica[0].$.flowEntry, currentGxpConfig.icaconf[0].ica[0].$.eflowEntry);

            res.render('modify', {
                title: "gxp环境参数修改",
                navbarIndex: "2",
                configTypeItemList: configTypeItemList,
                configItemList: configItemList,
                env: env,
                IPList: iPList,
            });
        });

        this.router.get('/showdetail', (req: Request, res: Response, next: NextFunction) => {
            const envname = req.query.envName;
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }
            const configName = req.query.configName;

            const detailConfig = GXPHelper.GetDetailConfig(currentGxp, configName);

            res.render('config', {
                env: detailConfig,
            });
        });

        this.router.get('/showDevice', (req: Request, res: Response, next: NextFunction) => {
            const envname = req.query.envName;
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            const configType = req.query.configType;

            const configItemList = GXPHelper.GetConfigDevices(currentGxp, false, DeviceType[configType]);

            res.render('device', {
                configItemList: configItemList,
            });

        });

        this.router.get('/searchDevice', (req: Request, res: Response, next: NextFunction) => {
            const envname = req.query.envName;
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            const searchText = req.query.searchText;

            const configItemList = GXPHelper.GetConfigDevices(currentGxp, true, DeviceType.ALL, searchText);

            res.render('device', {
                configItemList: configItemList,
            });

        });

        this.router.get('/submitDevice', (req: Request, res: Response, next: NextFunction) => {
            this.addAllowOrigin(res);
            const envname = req.query.envName;
            const currentGxp = GXPHelper.CurrentGxp(envname);
            if (!currentGxp) {
                res.writeHead(404);
                return res.end('不存在的Id');
            }

            const detail: any = req.query.configDetail;

            const configDetail = new ConfigDetail(detail.configId, detail.serviceIP, detail.port, detail.flow, detail.eflow);

            GXPHelper.ChangeDeviceDetail(currentGxp, configDetail);

            res.json({ result: 'success' });

        });
    }
}
