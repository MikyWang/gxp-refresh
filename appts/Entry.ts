import * as xml2js from 'xml2js';
import * as path from 'path';
import * as fs from 'fs';
import { GxpEnv } from './models/gxpEnv';
import { LinkRouter } from './routers/linkRouter';
import { GxpRouter } from './routers/GxpRouter';
import { TestRouter } from './routers/TestRouter';
import { GapsEnv } from './models/gapsEnv';
import { GapsRouter } from './routers/gapsRouter';
import { ESBRouter } from './routers/esbRouter';
const RouterType = [LinkRouter, GxpRouter, GapsRouter, ESBRouter, TestRouter];

export class Entry {

    private static _entry: Entry;
    private _routers: LinkRouter[];
    private _gxpIPs: Array<GxpEnv>;
    private _gapsEnvs: Array<GapsEnv>;
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

    public get GapsEnvs(): GapsEnv[] {
        this._gapsEnvs = [];
        let configs: any[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../envconfig.json'), "utf-8")).cnapconfig;
        configs.forEach(config => {
            this._gapsEnvs.push(new GapsEnv(config.ip, config.name, config.enname, config.tcflag, config.tcip, config.cnapsflag, config.user, config.password));
        });
        return this._gapsEnvs;
    }

    public get gxpIPs() {
        this._gxpIPs = [];
        let configs = JSON.parse(fs.readFileSync(path.join(__dirname, '../envconfig.json'), "utf-8")).configs;
        configs.forEach(config => {
            this._gxpIPs.push(new GxpEnv(config.name, config.ip, config.enname, config.isDev));
        });
        return this._gxpIPs;
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