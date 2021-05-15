import { CommonHelper } from "../helpers/commonHelper";
import * as fs from 'fs';
import { Entry } from "../Entry";

export class NormalPay {
    public pub: Pub;
    public hupp: Hupp;

    constructor(type: string) {
        let np = JSON.parse(fs.readFileSync(Entry.rootdir + '/cnaps/normalPay.json', "utf8"));
        this.pub = new Pub(np.pub);
        this.hupp = np.hupp;
        switch (type) {
            case "hvps":
                this.pub.appid = "hvps";
                this.pub.transcode = "961009";
                this.hupp.msgtp = "hvps.111.001.01";
                break;
            case "beps":
                this.pub.appid = "beps";
                this.pub.transcode = "961302";
                this.hupp.msgtp = "beps.121.001.01";
                break;
            default: break;
        }
    }

    public Save() {
        let data = JSON.stringify(this);
        fs.writeFileSync(Entry.rootdir + '/cnaps/normalPay.json', data);
    }

}

class Pub {
    public appid: string;
    public transcode: string;
    public provno: string;
    public transdep: string;
    public operator: string;
    public transdate: string;
    public transtime: string;
    public channelid: string;
    public termnum: string;
    public channelseq: string;
    public auther: string;
    public jiaoyima: string;

    constructor(pub: any) {
        this.appid = pub.appid;
        this.transcode = pub.transcode;
        this.provno = pub.provno;
        this.transdep = pub.transdep;
        this.operator = pub.operator;
        let date = new Date();
        this.transdate = CommonHelper.FormatString("{0}{1}{2}", date.getFullYear().toString(), date.getMonth().toString(), date.getDate().toString());
        this.transtime = CommonHelper.FormatString("{0}{1}{2}", date.getHours().toString(), date.getMinutes().toString(), date.getSeconds().toString());
        this.channelid = pub.channelid;
        this.termnum = pub.termnum;
        this.channelseq = CommonHelper.FormatString('{0}{1}', Date.now().toString(), CommonHelper.Random(1, 10000).toString());
        this.auther = pub.auther;
        this.jiaoyima = pub.jiaoyima;
    }
}

class Hupp {
    public interfacetp: string;
    public businum: string;
    public msgtp: string;
    public recvbkid: string;
    public txtpcd: string;
    public txctgypurpcd: string;
    public ccy: string;
    public amt: string;
    public feeamt: string;
    public feetflagcollect: string;
    public feeflagtransfer: string;
    public doubleflag: string;
    public trntype: string;
    public txsttlmprty: string;
    public payeraccno: string;
    public payername: string;
    public payeraddr: string;
    public payerbkid: string;
    public payerbknm: string;
    public rcveraccno: string;
    public rcvername: string;
    public rcveraddr: string;
    public rcverbkid: string;
    public rcverbknm: string;
    public ps: string;
    public ps2: string;
    public addword: string;
    public addword2: string;
    public checkoper: string;
    public intermediarybkid1: string;
    public Intermediarybkid2: string;
    public excsendflg: string;
    public addinfo_gk: string;
    public authpasswd: string;
    public zftj: string;
    public passwd: string;
    public cardseq: string;
    public payersttlmacct: string;
    public payersttlmacctnm: string;
    public send_flag: string;
    public gzauthflag: string;

}