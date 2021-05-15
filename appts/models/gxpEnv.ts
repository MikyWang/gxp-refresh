import { SFTPType } from '../Enums';
import { SshClientP } from './sshClientP';
export class GxpEnv {
    private _name: string;
    private _ip: string;
    private _enname: string;
    private _sshClient: SshClientP;
    private _isDev: boolean;

    public port: number = 22;
    public user: string = 'gxp';
    public password: string = 'Gzyhgxp@1234';

    constructor(name: string, ip: string, enname: string, isDev: boolean) {
        this._name = name;
        this._ip = ip;
        this._enname = enname;
        this._isDev = isDev;
    }

    public get isDev() {
        return this._isDev;
    }

    public get name() {
        return this._name;
    }

    public get ip() {
        return this._ip;
    }

    public get enname() {
        return this._enname;
    }

    public get tmpConfigFileName() {
        return './gxpconfpublic.xml';
    }

    public get remoteConfigFileName() {
        return 'cfg/gxpconfpublic.xml';
    }

    public get backupConfigFileName() {
        return '../build-gxp-env/config/' + this.enname + `.xml`;
    }

    public get sshClient(): SshClientP {
        return this._sshClient;
    }

    public async uploadOrGetConfigure(sftpType: SFTPType): Promise<IOption> {
        this._sshClient = new SshClientP(this.ip, this.port, this.user, this.password);
        let option = await this.sshClient.startConnection();
        let sftpParam = sftpType == SFTPType.get ? this.tmpConfigFileName : this.backupConfigFileName;
        option.cmdResult += (await this.sshClient.sFtpOperation(this.remoteConfigFileName, sftpParam, sftpType)).cmdResult;
        option.cmdResult += (await this.sshClient.stopConnection()).cmdResult;
        return option;
    }

    public async restartService(): Promise<IOption> {
        this._sshClient = new SshClientP(this.ip, this.port, this.user, this.password);
        let option = await this.sshClient.startConnection();
        let cmd = `stopgxp -e\n sleep 1\n startgxp\n sleep 1\n stopgxp -e\n sleep 1\n startgxp\n sleep 1\n exit\n`;
        option.cmdResult += (await this.sshClient.callShell(cmd)).cmdResult;
        option.cmdResult += (await this.sshClient.stopConnection()).cmdResult;
        return option;
    }
}