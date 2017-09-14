import * as xml2js from 'xml2js';
import * as path from 'path';
import * as fs from 'fs';
import { GxpEnv } from './models/gxpEnv';
import { LinkRouter } from './routers/linkRouter';
import { GxpRouter } from './routers/GxpRouter';
const RouterType = [LinkRouter, GxpRouter];

export class Entry {

    private static _entry: Entry;
    private _routers: LinkRouter[];
    private _gxpIPs: Array<GxpEnv>;
    private static _gxpServer: string = `http://10.16.51.63:8888/`;
    private static _rootdir: string = path.join(__dirname, '../');
    private _xmlParser: xml2js.Parser;
    private _xmlBuilder: xml2js.Builder;

    public static get entry() {
        return this._entry = this._entry || new Entry();
    }
    public get routers(): LinkRouter[] {
        if (!this._routers) {
            this.InitRouters(RouterType);
        }
        return this._routers;
    }

    public get gxpIPs() {
        if (!this._gxpIPs) {
            this._gxpIPs = [];
            let configs = JSON.parse(fs.readFileSync(path.join(__dirname, '../envconfig.json'), "utf-8")).configs;
            configs.forEach(config => {
                this._gxpIPs.push(new GxpEnv(config.name, config.ip, config.enname));
            });
        }
        return this._gxpIPs;
    }

    public static get gxpServer() {
        return this._gxpServer;
    }

    public static get rootdir() {
        return this._rootdir;
    }

    public get xmlParser() {
        return this._xmlParser = this._xmlParser || new xml2js.Parser();
    }

    public get xmlBuilder() {
        return this._xmlBuilder = this._xmlBuilder || new xml2js.Builder();
    }

    public InitRouters(routers) {
        this._routers = [];
        routers.forEach(router => {
            this._routers.push(new router);
        });
    }

}

exports.routers = Entry.entry.routers;