import { LinkRouter } from "./linkRouter";
import { NextFunction, Request, Response } from '~express/lib/express';
import * as path from 'path';
import { Entry } from "../Entry";
import { INIHelper } from "../helpers/INIHelper";
import { GapsEnv } from "../models/gapsEnv";
import { GXPHelper } from "../helpers/gxpHelper";
import { GapsHelper } from "../helpers/gapsHelper";

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
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true);
            let option: IOption = { cmdResult: '' };
            let db = await gapsEnv.getDBConfig(option);
            let message = '测试结果' + db.dbName + '\n' + db.password + '\n' + db.user + '\n';
            message += option.cmdResult;
            res.render('test', { message: message });
        });

        this.router.get('/restartGaps', async (req: Request, res: Response, next: NextFunction) => {
            let gapsEnv = new GapsEnv('10.20.161.32', '32二代', 'cnaps32', false, '', true);
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
    }
}