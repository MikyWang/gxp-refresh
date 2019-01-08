import { GapsEnv } from "../models/gapsEnv";
import { Entry } from "../Entry";
import * as fs from 'fs';
import { SshClient } from "../models/sshClient";
import { SFTPType, DeviceType } from "../Enums";
import { GxpEnv } from "../models/gxpEnv";
import { GXPHelper } from "./gxpHelper";

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

    public static async sendCmdFile(currentGaps: GapsEnv, cmd: string): Promise<string> {
        let opt: IOption = { cmdResult: '' };
        let cmdFile = this.genCmdFileName();
        let dir = 'tmp/' + cmdFile;
        fs.writeFileSync(Entry.rootdir + '/' + dir, cmd);
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

}