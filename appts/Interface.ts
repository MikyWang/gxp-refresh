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
}

interface ICnapsPanel {
    orgGxpIP: string;
    orgMan: string;
    orgNote: string;
    orgDate: string;
    clientIP: string;

}

interface IMap {
    key: string;
    value: any;
    comment?: string;
}

