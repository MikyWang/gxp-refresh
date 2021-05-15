import { SshClientP } from "./sshClientP";
import { CommonHelper } from "../helpers/commonHelper";

export class UServer {

    protected _ip: string;
    protected _user: string;
    protected _password: string;
    public port: number = 22;

    public get user(): string { return this._user; }
    public get password(): string { return this._password; }
    public get ip() { return this._ip; }

    constructor(ip: string, user: string, password: string) {
        this._ip = ip;
        this._password = password;
        this._user = user;
    }

    protected getSshClient(): SshClientP {
        return new SshClientP(this.ip, this.port, this.user, this.password);
    }

    public async ExecCmd(cmd: string): Promise<IOption> {
        let client = this.getSshClient();
        let option = await client.startConnection();
        let optionA = await client.ExecCmd(cmd);
        option = CommonHelper.RebulidOption(option, optionA);
        optionA = await client.stopConnection();
        option = CommonHelper.RebulidOption(option, optionA);
        return option;
    }

}