import { FieldType } from "../Enums";

export class ESBFiled {

    public fieldType: FieldType;
    public seriaNum: number;
    public field: string;
    public fieldNm: string;
    public dataType: string = 'STR';
    public minLen: string;
    public maxLen: string;
    public condition: string = '';
    public valueNeeded: string = '是';
    public dataFormat: string = '';
    public checkItem: string;
    public dict: string;
    public extField: string;
    public valExp: string;


}