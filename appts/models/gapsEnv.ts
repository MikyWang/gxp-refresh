import { SshClient } from "./sshClient";
import { SFTPType } from "../Enums";
import { INIHelper } from "../helpers/INIHelper";
import { GxpEnv } from "./gxpEnv";
import { GapsHelper } from "../helpers/gapsHelper";
import * as fs from 'fs';
import { Entry } from "../Entry";

export class GapsEnv {

    private _ip: string;
    private _name: string;
    private _enname: string;
    private _cnapsflag: boolean;
    private _tcflag: boolean;
    private _tcIPs: string[];

    public port: number = 22;
    public user: string = 'gaps';
    public password: string = 'gaps';

    constructor(ip: string, name: string, enname: string, tcflag: boolean, tcips: string, cnapsFlag: boolean) {
        this._ip = ip;
        this._name = name;
        this._enname = enname;
        this._tcflag = tcflag;
        this._tcIPs = tcips.split(',');
        this._cnapsflag = cnapsFlag;
    }


    public get tcFlag(): boolean { return this._tcflag; }
    public get tcIPs(): string[] { return this._tcIPs };
    public get cnapsFlag(): boolean { return this._cnapsflag };

    public get name() {
        return this._name;
    }

    public get ip() {
        return this._ip;
    }

    public get enname() {
        return this._enname;
    }

    public get remoteGapsIni() {
        return 'etc/gaps.ini';
    }

    public get tmpGapsIni() {
        return 'tmp/gaps.ini' + Date.now() * Math.random();
    }

    private get rcss(): string { return 'rcss_cfg.ini' };

    public getGxpPort(isDev: boolean): number {
        return isDev ? 31700 : 51700;
    }

    protected getSshClient(): SshClient {
        return new SshClient(this.ip, this.port, this.user, this.password);
    }

    public async getDBConfig(option?: IOption): Promise<IOracledb> {
        let opt: IOption = option || { cmdResult: '' };
        let promise = new Promise<IOracledb>(resolve => {
            let sshClient = this.getSshClient();
            sshClient.startConnection(option => {
                let tmpGapsIni = this.tmpGapsIni;
                sshClient.sFtpOperation(this.remoteGapsIni, tmpGapsIni, SFTPType.get, opti => {
                    sshClient.stopConnection();
                    let sections = INIHelper.parser(tmpGapsIni);
                    let user = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBUSER').value.trim();
                    let password = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBPWD').value.trim();
                    let dbName = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBNAME').value.trim();
                    resolve({ user: user, password: password, dbName: dbName });
                }, option);
            }, opt);
        });
        return promise;
    }

    public async  getGxpIP(): Promise<string> {
        if (!this.cnapsFlag) return new Promise<string>(resolve => { resolve('非二代环境暂无法使用') });
        let db = await this.getDBConfig();
        let cmdFileContent = `set heading off;\n`;
        cmdFileContent += `select trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n`;
        let cmdfile = await GapsHelper.sendCmdFile(this, cmdFileContent);
        let resultFile = GapsHelper.genCmdFileName();
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdfile + '>tmp/' + resultFile + '\n sleep 1\n exit\n';
        let promise = new Promise<string>(resolve => {
            let sshClient = this.getSshClient();
            sshClient.startConnection(option => {
                sshClient.callShell(cmd, option => {
                    sshClient.sFtpOperation('tmp/' + resultFile, 'tmp/' + resultFile, SFTPType.get, option => {
                        sshClient.stopConnection();
                        let result = fs.readFileSync(Entry.rootdir + '/tmp/' + resultFile, 'utf-8');
                        resolve(result);
                    }, option);
                }, option);
            }, { cmdResult: '' });
        });
        return promise;
    }

    public async restartService(option?: IOption): Promise<IOption> {
        let opt: IOption = option || { cmdResult: '' };
        let sshClient = this.getSshClient();
        let cmd = 'gapsshutdown.sh\n sleep 1\n echo y>tmp/test&gapsboot.sh<tmp/test\n sleep 1\n exit\n';
        let promise = new Promise<IOption>(resolve => {
            sshClient.startConnection(opts => {
                sshClient.callShell(cmd, option => {
                    sshClient.stopConnection();
                    resolve(option);
                }, opts);
            }, opt);
        });
        return promise;
    }

    public async connectGXP(currentGxp: GxpEnv): Promise<IOption> {
        if (!this.cnapsFlag) return new Promise<IOption>(resolve => { resolve({ cmdResult: '非二代环境暂无法使用' }) });
        let db = await this.getDBConfig();
        let gxpPort = this.getGxpPort(currentGxp.isDev);
        let cmdFileContent = `set heading off;\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `update ccms_localtranspara set paraval='` + currentGxp.ip + `' where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `update ccms_localtranspara set paraval='` + gxpPort + `' where paracd='/sys/gzbk/gxpport1';\n`;
        cmdFileContent += `commit;\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpport1';\n`;
        cmdFileContent += `exit;\n`;
        let cmdFile = await GapsHelper.sendCmdFile(this, cmdFileContent);
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdFile + '\n sleep 1\n exit\n';
        let promise = new Promise<IOption>(resolve => {
            let sshClient = this.getSshClient();
            sshClient.startConnection(option => {
                sshClient.callShell(cmd, option => {
                    sshClient.stopConnection();
                    resolve(option);
                }, option);
            }, { cmdResult: '' });
        });
        return promise;
    }

    public async changeTCConfig(enname: string, tcIP: string): Promise<IOption> {
        if (!this._tcflag) return new Promise<IOption>(resolve => { resolve({ cmdResult: '非二代同城环境暂无法使用' }) });
        let option: IOption = { cmdResult: '' };
        let cmd = `cd etc\n cp ` + this.rcss + `_` + enname + ` ` + this.rcss + '\n cat ' + this.rcss + '\n exit\n';
        let promise = new Promise<IOption>(resolve => {
            let sshClient = new SshClient(tcIP, 22, 'gaps', 'gaps');
            sshClient.startConnection(opt => {
                sshClient.callShell(cmd, async opt => {
                    sshClient.stopConnection();
                    await this.restartService(opt);
                    resolve(opt);
                }, opt);
            }, option);
        });
        return promise;
    }


}