import * as console from 'console';
import { GxpConfig } from '../models/gxpConfig';
import { SFTPType } from '../Enums';
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

    public static RefreshEnviroment(currentGxp: GxpEnv, callback: Function, options: any) {
        currentGxp.uploadOrGetConfigure(SFTPType.get, option => {
            let backConfig = new GxpConfig();
            let updateConfig = new GxpConfig();
            backConfig.convertToModel(currentGxp.backupConfigFileName);
            updateConfig.convertToModel(currentGxp.tmpConfigFileName);
            backConfig.updateConfig(updateConfig);
            backConfig.convertToXmlFile(currentGxp.backupConfigFileName);
            currentGxp.uploadOrGetConfigure(SFTPType.put, opt => {
                currentGxp.restartService(callback, opt);
            }, option);
        }, options);
    }
}