import { ConfigDetail, GroupItem, ItemList } from '../models/itemList';
import { GxpConfig } from '../models/gxpConfig';
import { DeviceType, SFTPType } from '../Enums';
import { Entry } from '../Entry';
import { GxpEnv } from '../models/gxpEnv';

export class GXPHelper {

    public static CurrentGxp(param: string): GxpEnv {
        let CurrentGxps = Entry.entry.gxpIPs.filter(gxp => (gxp.enname === param) || (gxp.ip === param) || (gxp.name === param));
        if (CurrentGxps.length != 1) {
            return null;
        }
        return CurrentGxps.shift();
    }

    public static async RefreshEnviroment(currentGxp: GxpEnv): Promise<IOption> {
        let option = await currentGxp.uploadOrGetConfigure(SFTPType.get);
        let backConfig = new GxpConfig();
        let updateConfig = new GxpConfig();
        backConfig.convertToModel(currentGxp.backupConfigFileName);
        updateConfig.convertToModel(currentGxp.tmpConfigFileName);
        backConfig.updateConfig(updateConfig);
        backConfig.convertToXmlFile(currentGxp.backupConfigFileName);
        option.cmdResult += (await currentGxp.uploadOrGetConfigure(SFTPType.put)).cmdResult;
        option.cmdResult += (await currentGxp.restartService()).cmdResult;
        return option;
    }

    public static CurrentGxpConfig(currentGxp: GxpEnv): GxpConfig {
        let gxpconfig = new GxpConfig();
        gxpconfig.convertToModel(currentGxp.backupConfigFileName);
        return gxpconfig;
    }

    public static GetDetailConfig(currentGxp: GxpEnv, configId: string): ConfigDetail {

        let currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);

        let icaConfig = currentGxpConfig.icaconf[0].ica.find(ic => ic.$.id == configId);
        if (icaConfig) {
            return new ConfigDetail(icaConfig.$.id, icaConfig.$.ipSet ? icaConfig.$.ipSet : '', icaConfig.$.port, icaConfig.$.flowEntry, icaConfig.$.eflowEntry);
        }
        let ocaConfig = currentGxpConfig.ocaconf[0].oca.find(ic => ic.$.id == configId);

        if (ocaConfig) {
            return new ConfigDetail(ocaConfig.$.id, ocaConfig.$.serviceIP ? ocaConfig.$.serviceIP : '', ocaConfig.$.portSet1 ? ocaConfig.$.portSet1 : '', ocaConfig.$.flowEntry, ocaConfig.$.eflowEntry);
        }

        return null;

    }

    public static GetConfigDevices(currentGxp: GxpEnv, isSearching: boolean, configType: DeviceType, searchText?: string): ItemList {

        let device = new ItemList('适配器', true, 'chooseDevice', 'config-header');
        device.searchEventName = 'searchDevice';
        let currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);
        let isDefault = true;
        if (isSearching) {
            let regexU = new RegExp(`.*` + searchText.toUpperCase() + `.*`);
            let regexL = new RegExp(`.*` + searchText.toLowerCase() + `.*`);
            let icaConfigs = currentGxpConfig.icaconf[0].ica.filter(ica => regexU.test(ica.$.id) || regexL.test(ica.$.id));
            let ocaConfigs = currentGxpConfig.ocaconf[0].oca.filter(oca => regexU.test(oca.$.id) || regexL.test(oca.$.id));
            if (icaConfigs.length > 0) {
                icaConfigs.forEach(element => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
            if (ocaConfigs.length > 0) {
                ocaConfigs.forEach(element => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
        } else {
            if (configType == DeviceType.ALL || configType == DeviceType.ICA) {
                currentGxpConfig.icaconf[0].ica.forEach(element => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
            if (configType == DeviceType.ALL || configType == DeviceType.OCA) {
                currentGxpConfig.ocaconf[0].oca.forEach(element => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
        }

        return device;
    }

    public static ChangeDeviceDetail(currentGxp: GxpEnv, configDetail: ConfigDetail) {

        let currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);
        let icaDevice = currentGxpConfig.icaconf[0].ica.find(ica => ica.$.id == configDetail.configId);
        if (icaDevice) {
            if (icaDevice.$.ipSet) {
                icaDevice.$.ipSet = configDetail.serviceIP;
            }
            if (icaDevice.$.port) {
                icaDevice.$.port = configDetail.port;
            }
            if (icaDevice.$.flowEntry) {
                icaDevice.$.flowEntry = configDetail.flow;
            }
            if (icaDevice.$.eflowEntry) {
                icaDevice.$.eflowEntry = configDetail.eflow;
            }
        }
        let ocaDevice = currentGxpConfig.ocaconf[0].oca.find(oca => oca.$.id == configDetail.configId);
        if (ocaDevice) {
            if (ocaDevice.$.serviceIP) {
                ocaDevice.$.serviceIP = configDetail.serviceIP;
            }
            if (ocaDevice.$.portSet1) {
                ocaDevice.$.portSet1 = configDetail.port;
            }
            if (ocaDevice.$.flowEntry) {
                ocaDevice.$.flowEntry = configDetail.flow;
            }
            if (ocaDevice.$.eflowEntry) {
                ocaDevice.$.eflowEntry = configDetail.eflow;
            }
        }
        currentGxpConfig.convertToXmlFile(currentGxp.backupConfigFileName);

    }

}