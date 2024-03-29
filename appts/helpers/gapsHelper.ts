<<<<<<< HEAD
import * as fs from 'fs';
import * as icov from 'iconv-lite';
import { DeviceType, SFTPType } from '../Enums';
import { Entry } from '../Entry';
import { GapsEnv } from '../models/gapsEnv';
import { GxpEnv } from '../models/gxpEnv';
import { GXPHelper } from './gxpHelper';
import { SshClientP } from '../models/sshClientP';
import { ItemList, GroupItem } from '../models/itemList';

export class GapsHelper {

    public static genCmdFileName(): string {
        return 'cmdFile' + Date.now();
    }

    public static currentGaps(param: string): GapsEnv {
        let CurrentGaps = Entry.entry.GapsEnvs.filter(gaps => (gaps.enname === param) || (gaps.ip === param) || (gaps.name === param));
        if (CurrentGaps.length != 1) {
            return null;
        }
        return CurrentGaps.shift();
    }

    public static async sendCmdFile(currentGaps: GapsEnv, cmd: string, isConvert?: boolean): Promise<IOption> {
        isConvert = isConvert || false;
        let cmdFile = this.genCmdFileName();
        let dir = 'tmp/' + cmdFile;
        if (isConvert) {
            let content = icov.encode(cmd, 'gb18030');
            fs.writeFileSync(Entry.rootdir + '/' + dir, content);
        } else {
            fs.writeFileSync(Entry.rootdir + '/' + dir, cmd);
        }
        let sshClient = new SshClientP(currentGaps.ip, currentGaps.port, currentGaps.user, currentGaps.password);
        let option = await sshClient.startConnection();
        option.cmdFile = cmdFile;
        option.cmdResult += (await sshClient.sFtpOperation('tmp/' + cmdFile, dir, SFTPType.put)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public static getSubmitInfo(currentGaps: GapsEnv): ICnapsPanel {
        let content = fs.readFileSync(Entry.rootdir + '/cnaps/' + currentGaps.enname + '.json', 'utf-8');
        let env: ICnapsPanel = JSON.parse(content);
        return env;
    }

    public static CnapsList(enname: string): ItemList {
        let IPList = new ItemList('二代环境', false, 'chooseIP', 'IP-header');
        Entry.entry.GapsEnvs.forEach(env => {
            if (env.cnapsFlag) {
                IPList.groupItems.push(new GroupItem(env.name + ` - ` + env.ip, env.enname == enname));
            }
        });
        return IPList;
    }

    public static async saveSubmitInfo(enname: string, env: ICnapsPanel): Promise<string> {
        let content = JSON.stringify(env);
        return new Promise<string>(resolve => {
            fs.writeFile(Entry.rootdir + '/cnaps/' + enname + '.json', content, err => {
                if (err) resolve(err.message);
                resolve('成功保存配置文件!');
            });
        });
    }

    public static async GetLogNames(currentGaps: GapsEnv, serialNum?: string): Promise<IOption> {
        let sshClient = new SshClientP(currentGaps.ip, currentGaps.port, currentGaps.name, currentGaps.password);
        let option = await sshClient.startConnection();
        let cmd = `cd ~/wqy\n test.sh cnaps39/cnaps39@gzcnapsdb 2019111900417180\n exit\n`;
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public static async RefreshCnaps(currentGaps: GapsEnv, currentGxp: GxpEnv): Promise<IOption> {
        let option = await currentGaps.connectGXP(currentGxp);
        let gxpConfig = GXPHelper.GetDetailConfig(currentGxp, 'OCA_CNAPS2');
        gxpConfig.serviceIP = currentGaps.ip;
        GXPHelper.ChangeDeviceDetail(currentGxp, gxpConfig);
        if (currentGaps.tcFlag) {
            for (let i = 0; i < currentGaps.tcIPs.length; i++) {
                option.cmdResult += (await currentGaps.changeTCConfig(currentGxp.enname, currentGaps.tcIPs[i])).cmdResult;
            }
        }
        option.cmdResult += (await GXPHelper.RefreshEnviroment(currentGxp)).cmdResult;
        return option;
    }

=======
import { GapsEnv } from "../models/gapsEnv";
import { Entry } from "../Entry";
import * as fs from 'fs';
import { SshClient } from "../models/sshClient";
import { SFTPType, DeviceType } from "../Enums";
import { GxpEnv } from "../models/gxpEnv";
import { GXPHelper } from "./gxpHelper";
import * as icov from 'iconv-lite';

export class GapsHelper {

    public static genCmdFileName(): string {
        return 'cmdFile' + Date.now();
    }

    public static currentGaps(param: string): GapsEnv {
        let CurrentGaps = Entry.entry.GapsEnvs.filter(gaps => (gaps.enname === param) || (gaps.ip === param) || (gaps.name === param));
        if (CurrentGaps.length != 1) {
            return null;
        }
        return CurrentGaps.shift();
    }

    public static async sendCmdFile(currentGaps: GapsEnv, cmd: string, isConvert?: boolean): Promise<string> {
        isConvert = isConvert || false;
        let opt: IOption = { cmdResult: '' };
        let cmdFile = this.genCmdFileName();
        let dir = 'tmp/' + cmdFile;
        if (isConvert) {
            let content = icov.encode(cmd, 'gb18030');
            fs.writeFileSync(Entry.rootdir + '/' + dir, content);
        } else {
            fs.writeFileSync(Entry.rootdir + '/' + dir, cmd);
        }
        let promise = new Promise<string>(resolve => {
            let sshClient = new SshClient(currentGaps.ip, currentGaps.port, currentGaps.user, currentGaps.password);
            sshClient.startConnection(option => {
                sshClient.sFtpOperation('tmp/' + cmdFile, dir, SFTPType.put, opt => {
                    sshClient.stopConnection();
                    resolve(cmdFile);
                }, option);
            }, opt);
        });
        return promise;
    }

    public static getSubmitInfo(currentGaps: GapsEnv): ICnapsPanel {
        let content = fs.readFileSync(Entry.rootdir + '/cnaps/' + currentGaps.enname + '.json', 'utf-8');
        let env: ICnapsPanel = JSON.parse(content);
        return env;
    }

    public static async saveSubmitInfo(enname: string, env: ICnapsPanel): Promise<string> {
        let content = JSON.stringify(env);
        return new Promise<string>(resolve => {
            fs.writeFile(Entry.rootdir + '/cnaps/' + enname + '.json', content, err => {
                if (err) resolve(err.message);
                resolve('成功保存配置文件!');
            });
        });
    }

    public static async GetLog(currentGaps: GapsEnv, serialNum?: string): Promise<IOption> {
        return null;
    }

    public static async RefreshCnaps(currentGaps: GapsEnv, currentGxp: GxpEnv): Promise<IOption> {
        let option = await currentGaps.connectGXP(currentGxp);
        let gxpConfig = GXPHelper.GetDetailConfig(currentGxp, 'OCA_CNAPS2');
        gxpConfig.serviceIP = currentGaps.ip;
        GXPHelper.ChangeDeviceDetail(currentGxp, gxpConfig);
        if (currentGaps.tcFlag) {
            for (let i = 0; i < currentGaps.tcIPs.length; i++) {
                option.cmdResult += (await currentGaps.changeTCConfig(currentGxp.enname, currentGaps.tcIPs[i])).cmdResult;
            }
        }
        return new Promise<IOption>(resolve => {
            GXPHelper.RefreshEnviroment(currentGxp, opt => {
                resolve(opt);
            }, option);
        });
    }

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}