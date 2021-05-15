<<<<<<< HEAD
import { SFTPType, DXZPTpye } from "../Enums";
import { INIHelper } from "../helpers/INIHelper";
import { GxpEnv } from "./gxpEnv";
import { GapsHelper } from "../helpers/gapsHelper";
import * as fs from 'fs';
import { Entry } from "../Entry";
import { SshClientP } from "./sshClientP";
import { UServer } from "./server";
import { CommonHelper } from "../helpers/commonHelper";
import * as icov from 'iconv-lite';

export class GapsEnv extends UServer {

    private _name: string;
    private _enname: string;
    private _cnapsflag: boolean;
    private _tcflag: boolean;
    private _tcIPs: string[];

    constructor(ip: string, name: string, enname: string, tcflag: boolean, tcips: string, cnapsFlag: boolean, user: string, password: string) {
        super(ip, user, password);
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

    public async getDBConfig(): Promise<IOption> {
        let option: IOption = { cmdResult: '' };
        let sshClient = this.getSshClient();
        option = await sshClient.startConnection();
        let tmpGapsIni = this.tmpGapsIni;
        option.cmdResult += (await sshClient.sFtpOperation(this.remoteGapsIni, tmpGapsIni, SFTPType.get)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        let sections = INIHelper.parser(tmpGapsIni);
        let user = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBUSER').value.trim();
        let password = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBPWD').value.trim();
        let dbName = sections.find(sc => sc.name == 'ENV').value.find(lc => lc.key == 'DBNAME').value.trim();
        option.iOracledb = { user: user, password: password, dbName: dbName };
        return option;
    }

    public async  getGxpIP(): Promise<IOption> {
        if (!this.cnapsFlag) return { cmdResult: '非二代环境暂无法使用' };
        let option = await GapsHelper.sendCmdFile(this, CommonHelper.BuildSQL(CommonHelper.GET_LINKED_GXPIP));
        let cmdfile = option.cmdFile;
        const optionF = await this.ExecSql(cmdfile);
        option = CommonHelper.RebulidOption(option, optionF);
        return option;
    }

    public async SendTrans(transfile: string, subsys: string = "gmjr"): Promise<IOption> {
        let client = this.getSshClient();
        let option = await client.startConnection();
        let filename = GapsHelper.genCmdFileName();
        option = await client.sFtpOperation('tmp/' + filename, transfile, SFTPType.put);
        let cmd = CommonHelper.FormatString(CommonHelper.SEND_TRANS, subsys, filename, filename + '_resp');
        option = await client.callShell(cmd);
        await client.sFtpOperation('tmp/' + filename + '_resp', 'tmp/' + filename + '_resp', SFTPType.get);
        await client.stopConnection();
        option.data = [];
        option.data.push(await CommonHelper.ReadGBKFile(Entry.rootdir + '/tmp/' + filename + '_resp'));
        return option;
    }

    public async ExecSql(cmdFile: string): Promise<IOption> {
        if (!this.cnapsFlag) return { cmdResult: '非二代环境暂无法使用' };
        let option = await this.getDBConfig();
        option.data = [];
        let db = option.iOracledb;
        let resultFile = GapsHelper.genCmdFileName();
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdFile + '>tmp/' + resultFile + '\n sleep 1\n exit\n';
        let sshClient = this.getSshClient();
        option.cmdResult += (await sshClient.startConnection()).cmdResult;
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.sFtpOperation('tmp/' + resultFile, 'tmp/' + resultFile, SFTPType.get)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        // let data = fs.readFileSync(Entry.rootdir + '/tmp/' + resultFile, 'utf-8');
        let promise = new Promise<string>(resolve => {
            fs.readFile(Entry.rootdir + '/tmp/' + resultFile, (err, data) => {
                let result = icov.decode(data, 'gbk');
                resolve(result);
            })
        })
        const data = await promise;
        option.data.push(data);
        return option;
    }

    public async restartService(): Promise<IOption> {
        let sshClient = this.getSshClient();
        let cmd = 'gapsshutdown.sh\n sleep 1\n echo y>tmp/test&gapsboot.sh<tmp/test\n sleep 1\n exit\n';
        let option = await sshClient.startConnection();
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public async restartComm(): Promise<IOption> {
        let sshClient = this.getSshClient();
        let cmd = 'gocomm&&cd bin&&end.sh\n sleep 1\n start.sh\n sleep 1\n exit\n';
        let option = await sshClient.startConnection();
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public async connectGXP(currentGxp: GxpEnv): Promise<IOption> {
        if (!this.cnapsFlag) return { cmdResult: '非二代环境暂无法使用' };
        let option = await this.getDBConfig();
        let db = option.iOracledb;
        let gxpPort = this.getGxpPort(currentGxp.isDev);
        let cmdFileContent = `set heading off;\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `update ccms_localtranspara set paraval='` + currentGxp.ip + `' where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `update ccms_localtranspara set paraval='` + gxpPort + `' where paracd='/sys/gzbk/gxpport1';\n`;
        cmdFileContent += `commit;\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpip';\n`;
        cmdFileContent += `select trim(paraps) ,trim(paraval) from ccms_localtranspara where paracd='/sys/gzbk/gxpport1';\n`;
        cmdFileContent += `exit;\n`;
        let optionF = await GapsHelper.sendCmdFile(this, cmdFileContent);
        let cmdFile = optionF.cmdFile;
        option.cmdResult += optionF.cmdResult;
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdFile + '\n sleep 1\n exit\n';
        let sshClient = this.getSshClient();
        option.cmdResult += (await sshClient.startConnection()).cmdResult;
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public async addDXZP(busType: DXZPTpye, cardType: string, info: IDXZPInfo): Promise<IOption> {
        if (this.cnapsFlag) return { cmdResult: '非中间业务平台无法使用' };
        let option = await this.getDBConfig();
        let db = option.iOracledb;
        if (cardType == 'id') info.account = `1_` + info.account;
        let cmdFileContent = `set heading off;\n`;
        cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
            + `_list where mddata='` + info.account + `';\n`;
        cmdFileContent += `insert into yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`) + `_list (XXLX, MDDATA, DTLY, AJLX, MDNAME, ORGCODE, GALXRXM, GALXRDH, GASHSJ, KKSJ, YXRQ, MDSM, EXTFLD) values ('0', '`
            + info.account + `', '1234', '01', '` + info.name + `', '111973889', '` + info.name + `', '13971011778', '20180921', '20170920', '60', '123', null);\n`;
        cmdFileContent += `commit;\n`;
        cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
            + `_list where mddata='` + info.account + `';\n`;
        cmdFileContent += `exit;\n`;
        let optionF = await GapsHelper.sendCmdFile(this, cmdFileContent, true);
        let cmdFile = optionF.cmdFile;
        option.cmdResult += optionF;
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdFile + '\n sleep 1\n exit\n';
        let sshClient = this.getSshClient();
        option.cmdResult += (await sshClient.startConnection()).cmdResult;
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }

    public async deleteDXZP(busType: DXZPTpye, cardType?: string, info?: IDXZPInfo): Promise<IOption> {
        if (this.cnapsFlag) return { cmdResult: '非中间业务平台无法使用' };
        let option = await this.getDBConfig();
        let db = option.iOracledb;
        let cmdFileContent = `set heading off;\n`;
        if (info != undefined) {
            if (cardType == 'id') info.account = `1_` + info.account;
            cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
                + `_list where mddata='` + info.account + `';\n`;
            cmdFileContent += `delete from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`) + `_list where mddata='` + info.account + `';\n`;
            cmdFileContent += `commit;\n`;
            cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
                + `_list where mddata='` + info.account + `';\n`;
        } else {
            cmdFileContent += `delete from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`) + `_list;\n`;
            cmdFileContent += `commit;\n`;
        }
        cmdFileContent += `exit;\n`;
        let optionF = await GapsHelper.sendCmdFile(this, cmdFileContent, true);
        let cmdFile = optionF.cmdFile;
        option.cmdResult += optionF;
        let cmd = `sqlplus -S ` + db.user + '/' + db.password + '@' + db.dbName + `<tmp/` + cmdFile + '\n sleep 1\n exit\n';
        let sshClient = this.getSshClient();
        option.cmdResult += (await sshClient.startConnection()).cmdResult;
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        return option;
    }



    public async changeTCConfig(enname: string, tcIP: string): Promise<IOption> {
        if (!this.cnapsFlag) return { cmdResult: '非二代环境暂无法使用' };
        let cmd = `cd etc\n cp ` + this.rcss + `_` + enname + ` ` + this.rcss + '\n cat ' + this.rcss + '\n exit\n';
        let sshClient = new SshClientP(tcIP, 22, 'gaps', 'gaps');
        let option = await sshClient.startConnection()
        option.cmdResult += (await sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await sshClient.stopConnection()).cmdResult;
        option.cmdResult += (await this.restartService()).cmdResult;
        return option;
    }



=======
import { SshClient } from "./sshClient";
import { SFTPType, DXZPTpye } from "../Enums";
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
    private _user: string;
    private _password: string;

    public port: number = 22;


    constructor(ip: string, name: string, enname: string, tcflag: boolean, tcips: string, cnapsFlag: boolean, user: string, password: string) {
        this._ip = ip;
        this._name = name;
        this._enname = enname;
        this._tcflag = tcflag;
        this._tcIPs = tcips.split(',');
        this._cnapsflag = cnapsFlag;
        this._user = user;
        this._password = password;
    }

    public get user(): string { return this._user; }
    public get password(): string { return this._password; }
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

    public async addDXZP(busType: DXZPTpye, cardType: string, info: IDXZPInfo): Promise<IOption> {
        if (this.cnapsFlag) return new Promise<IOption>(resolve => { resolve({ cmdResult: '非中间业务平台无法使用' }) });
        let db = await this.getDBConfig();
        if (cardType == 'id') info.account = `1_` + info.account;
        let cmdFileContent = `set heading off;\n`;
        cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
            + `_list where mddata='` + info.account + `';\n`;
        cmdFileContent += `insert into yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`) + `_list (XXLX, MDDATA, DTLY, AJLX, MDNAME, ORGCODE, GALXRXM, GALXRDH, GASHSJ, KKSJ, YXRQ, MDSM, EXTFLD) values ('0', '`
            + info.account + `', '1234', '01', '` + info.name + `', '111973889', '` + info.name + `', '13971011778', '20180921', '20170920', '60', '123', null);\n`;
        cmdFileContent += `commit;\n`;
        cmdFileContent += `select mddata,mdname from yw_dxzp_` + (busType == DXZPTpye.black ? `black` : `gray`)
            + `_list where mddata='` + info.account + `';\n`;
        cmdFileContent += `exit;\n`;
        let cmdFile = await GapsHelper.sendCmdFile(this, cmdFileContent, true);
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



>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}