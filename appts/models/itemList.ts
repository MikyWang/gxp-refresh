<<<<<<< HEAD
export class ItemList {

    public title: string;
    public isNeedSearch: boolean;
    public searchText: string;
    public searchEventName: string;
    public groupItems: Array<GroupItem>;
    public clickEventName: string;
    public headerId: string;

    constructor(title: string, isNeedSearch: boolean, clickEventName: string, headerId: string) {
        this.title = title;
        this.isNeedSearch = isNeedSearch;
        this.clickEventName = clickEventName;
        this.groupItems = new Array<GroupItem>();
        this.searchEventName = '';
        this.headerId = headerId;
    }
}

export class FormData {

    public id: string;
    public name: string;
    public type: string;
    public value: any;
    public readonly: boolean;

    constructor(id: string, name: string, type: string, value: any, readonly: boolean) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
        this.readonly = readonly;
    }
}

export class GroupItem {

    public itemName: string;
    public isActive: boolean;

    constructor(itemName: string, isActive: boolean) {
        this.itemName = itemName;
        this.isActive = isActive;
    }
}

export class ConfigDetail {

    public configId: string;
    public serviceIP: string = '';
    public port: string;
    public flow: string;
    public eflow: string;

    constructor(configId: string, serviceIP: string, port: string, flow: string, eflow: string) {
        this.configId = configId;
        this.serviceIP = serviceIP;
        this.port = port;
        this.flow = flow;
        this.eflow = eflow;
    }

=======
export class ItemList {

    public title: string;
    public isNeedSearch: boolean;
    public searchText: string;
    public searchEventName: string;
    public groupItems: Array<GroupItem>;
    public clickEventName: string;
    public headerId: string;

    constructor(title: string, isNeedSearch: boolean, clickEventName: string, headerId: string) {
        this.title = title;
        this.isNeedSearch = isNeedSearch;
        this.clickEventName = clickEventName;
        this.groupItems = new Array<GroupItem>();
        this.searchEventName = '';
        this.headerId = headerId;
    }
}

export class FormData {

    public id: string;
    public name: string;
    public type: string;
    public value: any;
    public readonly: boolean;

    constructor(id: string, name: string, type: string, value: any, readonly: boolean) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
        this.readonly = readonly;
    }
}

export class GroupItem {

    public itemName: string;
    public isActive: boolean;

    constructor(itemName: string, isActive: boolean) {
        this.itemName = itemName;
        this.isActive = isActive;
    }
}

export class ConfigDetail {

    public configId: string;
    public serviceIP: string = '';
    public port: string;
    public flow: string;
    public eflow: string;

    constructor(configId: string, serviceIP: string, port: string, flow: string, eflow: string) {
        this.configId = configId;
        this.serviceIP = serviceIP;
        this.port = port;
        this.flow = flow;
        this.eflow = eflow;
    }

>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}