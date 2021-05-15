import * as fs from 'fs';
import { Entry } from '../Entry';

export class INIHelper {

    public static parser(fileName: string): Section[] {
        let content = fs.readFileSync(Entry.rootdir + fileName, 'utf-8');
        let lines = content.split('\n');
        let ini = new Array<Section>();
        let currentSection = '';
        lines.forEach(line => {
            let sectionName = INIHelper.getSection(line);
            currentSection = sectionName || currentSection;
            if (sectionName != null) {
                let map = new Array<IMap>();
                ini.push({ name: sectionName, value: map });

            } else if (/.*=.*/.test(line)) {
                let key = line.split('=')[0];
                let value = line.split('=')[1].split('#')[0];
                let comment = line.split('=')[1].split('#')[1];
                if (ini.find(sc => sc.name == currentSection)) {
                    ini.find(sc => sc.name == currentSection).value.push({ key: key, value: value, comment: comment });
                }
            }
        });
        return ini;
    }

    private static getSection(content: string): string {
        let regex = /\[.*\]/;
        if (regex.test(content)) {
            return content.match(regex).shift().replace('[', '').replace(']', '');
        }
        return null;
    }

}