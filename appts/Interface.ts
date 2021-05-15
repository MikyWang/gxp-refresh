
interface $ {
    //public
    id: string;
    des: string;
    flowEntry: string;
    eflowEntry: string;
    sockConnType: string;
    operFlag: string;
    sockSyncFlag: string;
    syncChar: string;
    rcvPkgType: string;
    rcvPkgFmt: string;
    sndPkgFmt: string;
    forNumType: string;
    forNumLenType: string;
    forNumLen: string;
    whileFlagLen: string;
    whileFlagValue: string;
    heartBeat: string;
    HBCharReq: string;
    HBCharResp: string;
    //oca
    flowCtrl: string;
    timeOut: string;
    Otype: string;
    serviceIP: string;
    portSet1: string;
    portSet2: string;
    cocurrents: string;
    dataLenType: string;
    charLen: string;
    dataLenMode: string;
    para1: string;
    para2: string;
    para4: string;
    //channelnode
    adapterId: string;
    type: string;
    nodeIp: string;
    assistAdapterId: string;
    maxConn: string;
    maxFlow: string;
    timeout: string;
    varCfg: string;
    expired: string;
    //ica
    Itype: string;
    isDirect: string;
    DestOCA: string;
    authType: string;
    ipSet: string;
    port: string;
    //tpoll
    maxThreads: string;
}

interface tpoll {

}

interface INI {
    section: Section;
    comment: string;
}

interface Section {
    name: string;
    value: IMap[];
}

interface IOracledb {
    user: string;
    password: string;
    dbName: string;
}

interface IOption {
    cmdResult: string;
    cmdFile?: string;
    iOracledb?: IOracledb;
    data?: string[];
}

interface ILog {
    data: string;
    ready: boolean;
}

interface ICnapsPanel {
    ip?: string;
    enname?: string;
    name?: string;
    gxpIP: string;
    gxpName?: string;
    simulator: string;
    console: string;
}

interface IDXZPRequest {
    cardType: string;
    mdData: string;
    busType: string;
    mdName: string;
}

interface ICnapsRecordRequest {
    businum: string;
    tableName: string;
    counts: number;
}

interface IDXZPRequest {
    cardType: string;
    mdData: string;
    busType: string;
    mdName: string;
}

interface IMap {
    key: string;
    value: any;
    comment?: string;
}


interface ITransInfo {
    transName: string;
    transCode: string;
    transPro: string;
    transSece: string;
    transFlow?: string;
    transUser: string;
    transCtra: string;
    transCtph: string;
    extField?: string;
}

interface IDXZPInfo {
    account: string;
    name: string;
}

interface ITransRequest {
    env: string;
    trans: string;
    request: string;
    sys?: string;
}
