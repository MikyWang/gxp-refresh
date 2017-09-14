import { Entry } from '../Entry';
import * as path from 'path';
import * as iconvLite from 'iconv-lite';
import { SFTPType } from '../Enums';
import { Client } from 'ssh2';

export class SshClient extends Client {

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

    public startConnection(operation?: Function, options?: any) {
        this.on('ready', () => {
            console.log(this.toString());
            options.cmdResult += `<div><span class="text-warning">` + this.toString() + '</span></div>';
            if (operation) {
                operation(options);
            }
        }).connect({
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password
        });
    }

    public sFtpOperation(remotePath: string, localPath: string, type: SFTPType, operation?: Function, options?: any) {
        if (type == SFTPType.get) {
            this.sftp((error, sftp) => {
                if (error) throw error;
                sftp.fastGet(remotePath, path.join(Entry.rootdir, localPath), err => {
                    if (err) throw err;
                    console.log(this.toString() + `并取文件` + remotePath + `成功`);
                    options.cmdResult += `<div><span class="text-warning">` + this.toString() + `并取文件` + remotePath + `成功</span></div>`;
                    if (operation) {
                        operation(options);
                    }
                });
            })
        } else if (type == SFTPType.put) {
            this.sftp((error, sftp) => {
                sftp.fastPut(path.join(Entry.rootdir, localPath), remotePath, err => {
                    if (err) throw err;
                    console.log(this.toString() + `并上传文件` + remotePath + `成功`);
                    options.cmdResult += `<div><span class="text-warning">` + this.toString() + `并上传文件` + remotePath + `成功</span></div>`;
                    if (operation) {
                        operation(options);
                    }
                })
            })
        } else {
            throw { error: "不支持的sftp类型" };
        }
    }

    public callShell(cmd: string, operation?: Function, options?: any) {
        this.shell((err, stream) => {
            if (err) throw err;
            var bData = false;
            stream.on('close', () => {
                if (operation) {
                    console.log(this.toString() + `并执行命令` + cmd + `成功`);
                    options.cmdResult += `<div><span class="text-warning">` + this.toString() + `并执行命令` + cmd + `成功</span></div>`;
                    operation(options);
                }
            }).on('data', data => {
                if (bData == false) {
                    bData = true;
                    stream.write(cmd);
                    stream.end();
                }
                data = iconvLite.decode(data, 'gbk');
                if (options) {
                    options.cmdResult += `<div><span class="text-info">` + data + `</span></div>`;
                }
            }).stderr.on('data', data => {
                console.log(`发生了错误:` + data);
            });
        });
    }

    public stopConnection() {
        this.end();
        console.log(`成功断开` + this.host + `:` + this.port + `连接`);
    }

    public toString() {
        return `成功连接到` + this.host + `:` + this.port + `用户为:` + this.username;
    }
}