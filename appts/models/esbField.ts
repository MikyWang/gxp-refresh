<<<<<<< HEAD
import { FieldType } from "../Enums";

export class ESBFiled {

    public fieldType: FieldType;
    public seriaNum: number;
    public field: string;
    public fieldNm: string;
    public dataType: string = 'STR';
    public Length: string;
    public standard: string = '';
    public condition: string = '';
    public valueNeeded: string = '是';
    public dataFormat: string = '';
    public checkItem: string;
    public dict: string;
    public extField: string;
    public valExp: string;

    public build(): any[] {
        let content = [FieldType[this.fieldType], this.seriaNum, this.field, this.fieldNm, this.dataType, this.Length, this.standard, this.condition, this.valueNeeded, this.dataFormat, this.checkItem, this.dict, this.extField, this.valExp];
        return content;
    }

=======
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


>>>>>>> c20edd402b0e513661efb783f8981168af5ffcb0
}