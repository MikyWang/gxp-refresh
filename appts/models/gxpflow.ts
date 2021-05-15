import { Entry } from '../Entry';
import * as path from 'path';
import { CommonHelper } from '../helpers/commonHelper';

export class GxpFlow {
    public channel: FlowChannel[];

    public init(gxpflow: GxpFlow) {
        this.channel = gxpflow.channel;
    }

    public async convertToModel(fileName: string) {
        let content = await CommonHelper.ReadGBKFile(path.join(Entry.rootdir, fileName));
        let promise = new Promise<GxpFlow>(resolve => {
            Entry.entry.xmlParser.parseString(content, (error: any, result: any) => {
                resolve(result.cpm);
            });
        });
        this.init((await promise));
    }

    public get OutFlows(): FlowChannel[] {
        return this.channel.filter(channel => channel.$.name.startsWith("FLOWOUT"));
    }

    public get InFlows(): FlowChannel[] {
        return this.channel.filter(channel => channel.$.name.startsWith("FLOWIN"));
    }

    public get Transports(): Transport[] {
        const transports = [];
        this.InFlows.forEach(flow => {
            let fields = flow.$.name.split("_");
            transports.push(new Transport(fields[1], flow.$.name));
        });
        return transports;
    }

}

export class Transport {
    public from: string = '';
    public fromName: string = '';
    public to: string = '';
    public toName: string = '';
    public flowName: string;

    constructor(source: string, flowName: string) {
        let getTo = false;
        for (let index = 0; index < source.length; index++) {
            const element = source[index];
            if (element == '2') {
                getTo = true;
                continue;
            }
            if (getTo) {
                this.to += element;
            } else {
                this.from += element;
            }
        }
        this.fromName = Entry.entry.ChannelName.get(this.from);
        this.toName = Entry.entry.ChannelName.get(this.to);
        this.flowName = flowName;
    }

}

export class FlowChannel {
    public $: FlowChannelModel;
    public node: Node[];
    public route: Route[];

}

export class FlowChannelModel {
    public des: string;
    public group: string;
    public name: string;
}

export class Node {
    public $: NodeModel;
    public para: Para[];
    public exit: Exit[];
}

export class Exit {
    public $: ExitModel;
}

export class Para {
    public $: ParaModel;
}

export class ParaModel {
    public type: string;
    public value: string;
    public inout: string;
    public des: string;
}
export class ExitModel {
    public to: string;
    public data: string;
    public is_write_route: string;
    public des: string;
}
export class NodeModel {
    public name: string;
    public plugin: string;
    public des: string;
    public ct: string;
}

export class Route {
    public $: RouteModel;
}

export class RouteModel {
    public type: string;
    public data: string;
    public to: string;
}