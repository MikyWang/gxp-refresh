import { LinkRouter } from "./linkRouter";
import { NextFunction, Request, Response } from '~express/lib/express';
import { GxpFlow } from "../models/gxpflow";
import xlsx from 'node-xlsx';
import * as fs from "fs";
import { Entry } from "../Entry";
import * as path from 'path';
import { GXPHelper } from "../helpers/gxpHelper";

export class FileRouter extends LinkRouter {
    constructor() {
        super();
        this.link = '/file';
    }

    initPath(): any {
        this.router.get('/file-manager', (req: Request, resp: Response, next: NextFunction) => {
            resp.render('filemanager', {
                title: "文件管理",
                navbarIndex: "7",
            });
        });
        this.router.get('/flow-download', async (req: any, resp: Response, next: NextFunction) => {
            let gxpFlow = new GxpFlow();
            await gxpFlow.convertToModel("gxpFlowpublic.xml");
            let transports = gxpFlow.Transports;
            const sheet = [];
            const title = ['接入', '接入名称', '接出', '接出名称', '流程名'];
            const options = { '!cols': [{ wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 30 }, { wch: 50 }] }
            sheet.push(title);
            transports.forEach(transport => {
                let data = [transport.from, transport.fromName, transport.to, transport.toName, transport.flowName];
                sheet.push(data);
            });
            const buffer = xlsx.build([{ name: 'transport', data: sheet }], options);
            fs.writeFileSync(path.join(Entry.rootdir, 'public/gxp/transport.xlsx'), buffer);
            resp.json('gxp/transport.xlsx');
        });
        this.router.get('/ica-ports', async (req: any, resp: Response, next: NextFunction) => {
            const gxp = GXPHelper.CurrentGxp("wl43");
            const config = GXPHelper.CurrentGxpConfig(gxp);

            const sheet = [];
            const title = ['系统名称', '系统ip', '端口号', '端口协议'];
            const options = { '!cols': [{ wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 30 }, { wch: 50 }] }
            sheet.push(title);
            config.icaconf[0].ica.forEach(transport => {
                let data = ["gxp", "", transport.$.port, "TCP"];
                sheet.push(data);
            });
            const buffer = xlsx.build([{ name: 'ica-port', data: sheet }], options);
            fs.writeFileSync(path.join(Entry.rootdir, 'public/gxp/ica-port.xlsx'), buffer);
            resp.json('gxp/ica-port.xlsx');
        });
    }
}