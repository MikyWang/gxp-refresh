import { Entry } from '../Entry';
import * as path from 'path';
import * as fs from 'fs';
export class GxpConfig {

    public tpoll: Tpoll[];
    public ocaconf: OcaList[];
    public nodeconf: ChannelNodeList[];
    public icaconf: IcaList[];

    public init(gxpConfig: GxpConfig) {
        this.ocaconf = gxpConfig.ocaconf;
        this.nodeconf = gxpConfig.nodeconf;
        this.icaconf = gxpConfig.icaconf;
        this.tpoll = gxpConfig.tpoll;
    }

    public convertToModel(fileName: string) {
        let content = fs.readFileSync(path.join(Entry.rootdir, fileName), 'utf-8');
        Entry.entry.xmlParser.parseString(content, (error: any, result: any) => {
            this.init(result.gxpconf);
        });
    }

    public convertToXmlFile(fileName: string) {
        let GxpConf = function (gxpconf) {
            this.gxpconf = gxpconf;
        }
        let gxpconf = new GxpConf(this);
        let content = Entry.entry.xmlBuilder.buildObject(gxpconf);
        fs.writeFileSync(path.join(Entry.rootdir, fileName), content);
    }

    public updateConfig(gxpConfig: GxpConfig) {
        let update = (conf: any, elem: any) => {
            if (!conf.find(con => con.$.id == elem.$.id)) {
                console.log(`新增节点：` + elem);
                conf.push(elem);
            }
        };
        gxpConfig.icaconf[0].ica.forEach(icaElem => {
            update(this.icaconf[0].ica, icaElem);
        })
        gxpConfig.ocaconf[0].oca.forEach(ocaElem => {
            update(this.ocaconf[0].oca, ocaElem);
        })
        gxpConfig.nodeconf[0].channelnode.forEach(nodeElem => {
            update(this.nodeconf[0].channelnode, nodeElem);
        })
        gxpConfig.tpoll.forEach(poll => {
            update(this.tpoll, poll);
        })
    }
}

export class Tpoll {
    public $: TpollModel;
    constructor(tpoll: Tpoll) {
        this.$ = tpoll.$;
    }
}

export class TpollModel {
    public maxThreads: string;
    constructor(tpoll: TpollModel) {
        this.maxThreads = tpoll.maxThreads;
    }
}

export class Oca {
    public $: ocaModel;
    constructor(oca: Oca) {
        this.$ = oca.$;
    }
}

export class OcaList {
    public oca: Oca[];
    constructor(ocaList: OcaList) {
        this.oca = ocaList.oca;
    }
}

export class ocaModel {
    public id: string;
    public des: string;
    public flowEntry: string;
    public eflowEntry: string;
    public flowCtrl: string;
    public timeOut: string;
    public Otype: string;
    public serviceIP: string;
    public portSet1: string;
    public portSet2: string;
    public cocurrents: string;
    public sockConnType: string;
    public operFlag: string;
    public sockSyncFlag: string;
    public syncChar: string;
    public rcvPkgType: string;
    public sndPkgFmt: string;
    public rcvPkgFmt: string;
    public dataLenType: string;
    public charLen: string;
    public dataLenMode: string;
    public para1: string;
    public para2: string;
    public forNumType: string;
    public forNumLenType: string;
    public forNumLen: string;
    public whileFlagLen: string;
    public whileFlagValue: string;
    public heartBeat: string;
    public HBCharReq: string;
    public HBCharResp: string;
    public para4: string;

    constructor(oca: ocaModel) {
        this.id = oca.id;
        this.charLen = oca.charLen;
        this.cocurrents = oca.cocurrents;
        this.dataLenMode = oca.dataLenMode;
        this.dataLenType = oca.dataLenType;
        this.des = oca.des;
        this.eflowEntry = oca.eflowEntry;
        this.flowCtrl = oca.flowCtrl;
        this.flowEntry = oca.flowEntry;
        this.forNumLen = oca.forNumLen;
        this.forNumLenType = oca.forNumLenType;
        this.forNumType = oca.forNumType;
        this.HBCharReq = oca.HBCharReq;
        this.HBCharResp = oca.HBCharResp;
        this.heartBeat = oca.heartBeat;
        this.operFlag = oca.operFlag;
        this.Otype = oca.Otype;
        this.para1 = oca.para1;
        this.para2 = oca.para2;
        this.para4 = oca.para4;
        this.portSet1 = oca.portSet1;
        this.portSet2 = oca.portSet2;
        this.rcvPkgFmt = oca.rcvPkgFmt;
        this.rcvPkgType = oca.rcvPkgType;
        this.serviceIP = oca.serviceIP;
        this.sndPkgFmt = oca.sndPkgFmt;
        this.sockConnType = oca.sockConnType;
        this.sockSyncFlag = oca.sockSyncFlag;
        this.syncChar = oca.syncChar;
        this.timeOut = oca.timeOut;
        this.whileFlagLen = oca.whileFlagLen;
        this.whileFlagValue = oca.whileFlagValue;
    }
}

export class Ica {
    public $: IcaModel;
    constructor(ica: Ica) {
        this.$ = ica.$;
    }
}

export class IcaList {
    public ica: Ica[];
    constructor(icaList: IcaList) {
        this.ica = icaList.ica;
    }
}

export class IcaModel {
    public id: string;
    public des: string;
    public flowEntry: string;
    public eflowEntry: string;
    public sockConnType: string;
    public operFlag: string;
    public sockSyncFlag: string;
    public syncChar: string;
    public rcvPkgType: string;
    public rcvPkgFmt: string;
    public sndPkgFmt: string;
    public forNumType: string;
    public forNumLenType: string;
    public forNumLen: string;
    public whileFlagLen: string;
    public whileFlagValue: string;
    public heartBeat: string;
    public HBCharReq: string;
    public HBCharResp: string;
    public Itype: string;
    public isDirect: string;
    public DestOCA: string;
    public authType: string;
    public ipSet: string;
    public port: string;
    public dataLenType: string;
    public charLen: string;
    public dataLenMode: string;
    public para1: string;
    public para2: string;

    constructor(ica: IcaModel) {
        this.id = ica.id;
        this.charLen = ica.charLen;
        this.dataLenMode = ica.dataLenMode;
        this.dataLenType = ica.dataLenType;
        this.des = ica.des;
        this.eflowEntry = ica.eflowEntry;
        this.flowEntry = ica.flowEntry;
        this.forNumLen = ica.forNumLen;
        this.forNumLenType = ica.forNumLenType;
        this.forNumType = ica.forNumType;
        this.HBCharReq = ica.HBCharReq;
        this.HBCharResp = ica.HBCharResp;
        this.heartBeat = ica.heartBeat;
        this.operFlag = ica.operFlag;
        this.para1 = ica.para1;
        this.para2 = ica.para2;
        this.rcvPkgFmt = ica.rcvPkgFmt;
        this.rcvPkgType = ica.rcvPkgType;
        this.sndPkgFmt = ica.sndPkgFmt;
        this.sockConnType = ica.sockConnType;
        this.sockSyncFlag = ica.sockSyncFlag;
        this.syncChar = ica.syncChar;
        this.whileFlagLen = ica.whileFlagLen;
        this.whileFlagValue = ica.whileFlagValue;
        this.Itype = ica.Itype;
        this.isDirect = ica.isDirect;
        this.DestOCA = ica.DestOCA;
        this.authType = ica.authType;
        this.ipSet = ica.ipSet;
        this.port = ica.port;
    }
}

export class ChannelNode {
    public $: ChannelNodeModel;
    constructor(channelnode: ChannelNode) {
        this.$ = channelnode.$;
    }
}

export class ChannelNodeList {
    public channelnode: ChannelNode[];
    constructor(nodeList: ChannelNodeList) {
        this.channelnode = nodeList.channelnode;
    }
}

export class ChannelNodeModel {
    public id: string;
    public adapterId: string;
    public des: string;
    public type: string;
    public nodeIp: string;
    public assistAdapterId: string;
    public maxConn: string;
    public maxFlow: string;
    public timeout: string;
    public varCfg: string;
    public expired: string;

    constructor(channelnode: ChannelNodeModel) {
        this.adapterId = channelnode.adapterId;
        this.assistAdapterId = channelnode.assistAdapterId;
        this.des = channelnode.des;
        this.expired = channelnode.expired;
        this.id = channelnode.id;
        this.maxConn = channelnode.maxConn;
        this.maxFlow = channelnode.maxFlow;
        this.nodeIp = channelnode.nodeIp;
        this.timeout = channelnode.timeout;
        this.type = channelnode.type;
        this.varCfg = channelnode.varCfg;
    }
}