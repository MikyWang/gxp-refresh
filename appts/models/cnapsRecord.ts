export class CnapsRecord {
    public businum: string = '';
    public msgid: string = '';
    public sendbkid: string = '';
    public orgsnder: string = '';
    public recvbkid: string = '';
    public orgrcver: string = '';
    public orgno: string = '';
    public channelid: string = '';
    public channelseq: string = '';
    public wkdt: string = '';
    public payseqno: string = '';
    public txtpcd: string = '';
    public amt: string = '';
    public payerbkid: string = '';
    public payerbknm: string = '';
    public payeraccno: string = '';
    public payername: string = '';
    public rcverbkid: string = '';
    public rcverbknm: string = '';
    public rcveraccno: string = '';
    public rcvername: string = '';
    public addword: string = '';
    public trstatus: string = '';
    public corebksts: string = '';
    public txsts: string = '';
    public respcode: string = '';
    public respmsg: string = '';

    public getFields(): string[] {
        const strBuilder = [];
        for (const key in this) {
            if (!(typeof key === 'function')) {
                strBuilder.push(key);
            }
        }
        return strBuilder;
    }

}