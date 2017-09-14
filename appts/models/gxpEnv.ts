import { SFTPType } from '../Enums';
import { SshClient } from './sshClient';
export class GxpEnv {
    private _name: string;
    private _ip: string;
    private _enname: string;
    private _sshClient: SshClient;

    public port: number = 22;
    public user: string = 'gxp';
    public password: string = 'gxp';

    constructor(name: string, ip: string, enname: string) {
        this._name = name;
        this._ip = ip;
        this._enname = enname;
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

    public get sshClient(): SshClient {
        return this._sshClient;
    }

    public uploadOrGetConfigure(sftpType: SFTPType, callback: Function, options: any) {
        this._sshClient = new SshClient(this.ip, this.port, this.user, this.password);
        this.sshClient.startConnection(option => {
            let sftpParam = sftpType == SFTPType.get ? this.tmpConfigFileName : this.backupConfigFileName;
            this.sshClient.sFtpOperation(this.remoteConfigFileName, sftpParam, sftpType, opt => {
                this.sshClient.stopConnection();
                if (callback) {
                    callback(opt);
                }
            }, option);
        }, options);
    }

    public restartService(callback, options) {
        this._sshClient = new SshClient(this.ip, this.port, this.user, this.password);
        this.sshClient.startConnection(option => {
            let cmd = `stopgxp -e\n startgxp\n sleep 2\n stopgxp -e\n startgxp\n sleep 2\n exit\n`;
            this.sshClient.callShell(cmd, opt => {
                this.sshClient.stopConnection();
                if (callback) {
                    callback(opt);
                }
            }, option);
        }, options);
    }
}