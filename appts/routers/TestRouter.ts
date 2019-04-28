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
}