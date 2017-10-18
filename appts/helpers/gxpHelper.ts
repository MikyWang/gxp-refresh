import * as console from 'console';
import { Entry } from '../Entry';
import { DeviceType, SFTPType } from '../Enums';
import { GxpConfig } from '../models/gxpConfig';
import { GxpEnv } from '../models/gxpEnv';
import { ConfigDetail, GroupItem, ItemList } from '../models/itemList';
export class GXPHelper {

    public static CurrentGxp(param: string): GxpEnv {
        const CurrentGxps = Entry.entry.gxpIPs.filter((gxp) => (gxp.enname === param) || (gxp.ip === param) || (gxp.name === param));
        if (CurrentGxps.length !== 1) {
            return null;
        }
        return CurrentGxps.shift();
    }

    public static RefreshEnviroment(currentGxp: GxpEnv, callback: (option) => void, options: any) {
        currentGxp.uploadOrGetConfigure(SFTPType.get, (option) => {
            const backConfig = new GxpConfig();
            const updateConfig = new GxpConfig();
            backConfig.convertToModel(currentGxp.backupConfigFileName);
            updateConfig.convertToModel(currentGxp.tmpConfigFileName);
            backConfig.updateConfig(updateConfig);
            backConfig.convertToXmlFile(currentGxp.backupConfigFileName);
            currentGxp.uploadOrGetConfigure(SFTPType.put, (opt) => {
                currentGxp.restartService(callback, opt);
            }, option);
        }, options);
    }

    public static CurrentGxpConfig(currentGxp: GxpEnv): GxpConfig {
        const gxpconfig = new GxpConfig();
        gxpconfig.convertToModel(currentGxp.backupConfigFileName);
        return gxpconfig;
    }

    public static GetDetailConfig(currentGxp: GxpEnv, configId: string): ConfigDetail {

        const currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);

        const icaConfig = currentGxpConfig.icaconf[0].ica.find((ic) => ic.$.id === configId);
        if (icaConfig) {
            return new ConfigDetail(icaConfig.$.id, icaConfig.$.ipSet ? icaConfig.$.ipSet : '', icaConfig.$.port, icaConfig.$.flowEntry, icaConfig.$.eflowEntry);
        }
        const ocaConfig = currentGxpConfig.ocaconf[0].oca.find((ic) => ic.$.id === configId);

        if (ocaConfig) {
            return new ConfigDetail(ocaConfig.$.id, ocaConfig.$.serviceIP ? ocaConfig.$.serviceIP : '', ocaConfig.$.portSet1 ? ocaConfig.$.portSet1 : '', ocaConfig.$.flowEntry, ocaConfig.$.eflowEntry);
        }

        return null;

    }

    public static GetConfigDevices(currentGxp: GxpEnv, isSearching: boolean, configType: DeviceType, searchText?: string): ItemList {

        const device = new ItemList('适配器', true, 'chooseDevice', 'config-header');
        device.searchEventName = 'searchDevice';
        const currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);
        let isDefault = true;
        if (isSearching) {
            const regex = new RegExp(`.*` + searchText.toUpperCase() + `.*`);
            const icaConfigs = currentGxpConfig.icaconf[0].ica.filter((ica) => regex.test(ica.$.id));
            const ocaConfigs = currentGxpConfig.ocaconf[0].oca.filter((oca) => regex.test(oca.$.id));
            if (icaConfigs.length > 0) {
                icaConfigs.forEach((element) => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
            if (ocaConfigs.length > 0) {
                ocaConfigs.forEach((element) => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
        } else {
            if (configType === DeviceType.ALL || configType === DeviceType.ICA) {
                currentGxpConfig.icaconf[0].ica.forEach((element) => {
                    device.groupItems.push(new GroupItem(element.$.id, isDefault));
                    if (isDefault) {
                        isDefault = !isDefault;
                    }
                });
            }
            if (configType === DeviceType.ALL || configType === DeviceType.OCA) {
                currentGxpConfig.ocaconf[0].oca.forEach((element) => {
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

        const currentGxpConfig = GXPHelper.CurrentGxpConfig(currentGxp);
        const icaDevice = currentGxpConfig.icaconf[0].ica.find((ica) => ica.$.id === configDetail.configId);
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
        const ocaDevice = currentGxpConfig.ocaconf[0].oca.find((oca) => oca.$.id === configDetail.configId);
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
