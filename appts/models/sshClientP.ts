import * as iconvLite from 'iconv-lite';
import * as path from 'path';
import { Client } from "ssh2";
import { Entry } from "../Entry";
import { SFTPType } from "../Enums";
import { CommonHelper } from "../helpers/commonHelper";

export class SshClientP extends Client {

    public host: string;
    public port: number;
    public username: string;
    public password: string;

    constructor(host: string, port: number, username: string, password: string) {
        super();
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
    }

    public async startConnection(): Promise<IOption> {
        let promise = new Promise<IOption>(resolve => {
            this.on('ready', () => {
                let option: IOption = { cmdResult: '' };
                option.cmdResult += CommonHelper.BuildLog(this.toString());
                resolve(option);
            }).connect({
                host: this.host,
                port: this.port,
                username: this.username,
                password: this.password
            });
        })
        return promise;
    }

    public async stopConnection(): Promise<IOption> {
        let promise = new Promise<IOption>(resolve => {
            this.on('end', () => {
                let option: IOption = { cmdResult: '' };
                option.cmdResult += CommonHelper.BuildLog(`成功断开` + this.host + `:` + this.port + `连接`);
                resolve(option);
            }).end();
        });
        return promise;
    }

    public async ExecCmd(cmd: string): Promise<IOption> {
        return new Promise<IOption>(resolve => {
            let option: IOption = { cmdResult: '', data: [] };
            this.exec(cmd, (error, stream) => {
                if (error) resolve({ cmdResult: error.message });
                stream.on('close', () => {
                    option.cmdResult += CommonHelper.BuildLog(this.toString() + `并执行命令` + cmd + `成功`);
                    resolve(option);
                }).on('data', data => {
                    data = iconvLite.decode(data, 'gbk');
                    option.data.push(data);
                    option.cmdResult += CommonHelper.BuildLog(data);
                }
                ).stderr.on('data', data => {
                    option.cmdResult += CommonHelper.BuildLog(`发生了错误:` + data);
                    stream.end();
                });
            });
        });
    }

    public async callShell(cmd: string): Promise<IOption> {
        let promise = new Promise<IOption>(resolve => {
            let option: IOption = { cmdResult: '', data: [] };
            this.shell((err, stream) => {
                if (err) resolve({ cmdResult: err.message });
                var bData = false;
                stream.on('close', () => {
                    option.cmdResult += CommonHelper.BuildLog(this.toString() + `并执行命令` + cmd + `成功`);
                    resolve(option);
                }).on('data', data => {
                    if (bData == false) {
                        bData = true;
                        stream.write(cmd);
                        stream.end();
                    }
                    data = iconvLite.decode(data, 'gbk');
                    option.data.push(data);
                    option.cmdResult += CommonHelper.BuildLog(data);
                }).stderr.on('data', data => {
                    option.cmdResult += CommonHelper.BuildLog(`发生了错误:` + data);
                    stream.end();
                });
            });
        });
        return promise;
    }

    public async sFtpOperation(remotePath: string, localPath: string, type: SFTPType): Promise<IOption> {
        let promise = new Promise<IOption>(resolve => {
            this.sftp((error, sftp) => {
                let option: IOption = { cmdResult: '' };
                if (error) resolve({ cmdResult: error.message });
                switch (type) {
                    case SFTPType.get:
                        sftp.fastGet(remotePath, path.join(Entry.rootdir, localPath), err => {
                            if (err) resolve({ cmdResult: err });
                            option.cmdResult += CommonHelper.BuildLog(this.toString() + `并获取文件` + remotePath + `成功`);
                            resolve(option);
                        })
                        break;
                    case SFTPType.put:
                        sftp.fastPut(path.join(Entry.rootdir, localPath), remotePath, err => {
                            if (err) resolve({ cmdResult: err });
                            option.cmdResult += CommonHelper.BuildLog(this.toString() + `并上传文件` + remotePath + `成功`);
                            resolve(option);
                        });
                        break;
                    default:
                        resolve(option);
                        break;
                }
            });
        });

        return promise;

    }


    public toString() {
        return `成功连接到` + this.host + `:` + this.port + `用户为:` + this.username;
    }
}