import { Entry } from '../Entry';
import { GXPHelper } from '../helpers/gxpHelper';
import { GxpConfig } from '../models/gxpConfig';
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
            this.addAllowOrigin(res);

            let envname = req.query.envName;
            let currentGxp = GXPHelper.CurrentGxp(envname);


            let gxpconfig = new GxpConfig();
            gxpconfig.convertToModel('./gxpconfpublic.xml');

            res.render('modify', {
                title: "gxp环境参数修改",
                configs: Entry.entry.gxpIPs,
                navbarIndex: "2"
            });
        });
    }



    // refreshEnv(callback: Function, opt: any): any {
    //     let currentGxp = opt.currentGxps.pop();
    //     let client = new SshClient(currentGxp.ip, currentGxp.port, currentGxp.user, currentGxp.password);
    //     let options = { cmdResult: '' };
    //     client.startConnection(option => {
    //         let backFileName = '../build-gxp-env/config/' + opt.envname + `.xml`;
    //         let updateFileName = './gxpconfpublic.xml';
    //         let remoteFileName = 'cfg/gxpconfpublic.xml';
    //         client.sFtpOperation(remoteFileName, updateFileName, SFTPType.get, option => {
    //             let backConfig = new GxpConfig();
    //             let updateConfig = new GxpConfig();
    //             backConfig.convertToModel(backFileName);
    //             updateConfig.convertToModel(updateFileName);
    //             backConfig.updateConfig(updateConfig);
    //             backConfig.convertToXmlFile(backFileName);
    //             client.sFtpOperation(remoteFileName, backFileName, SFTPType.put, option => {
    //                 let cmd = `stopgxp -e\n startgxp\n sleep 2\n stopgxp -e\n startgxp\n sleep 2\n exit\n`;
    //                 client.callShell(cmd, option => {
    //                     opt.result = option.cmdResult;
    //                     callback(opt);
    //                     client.stopConnection();
    //                 }, options);
    //             }, options);
    //         }, options);
    //     }, options);
    // }
}