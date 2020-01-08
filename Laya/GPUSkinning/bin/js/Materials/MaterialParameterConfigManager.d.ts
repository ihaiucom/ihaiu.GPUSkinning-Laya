import { Cartoon2Material } from "./Cartoon2Material";
import DissolveMaterial from "./DissolveMaterial";
import Vector4 = Laya.Vector4;
interface Cartoon2MaterialParameter {
    outlinewidth: number;
    mainColor: number[];
    shadowColor: number[];
    colorDeep: number;
    colorRange: number;
}
export default class MaterialParameterConfigManager {
    static configsJson: any;
    static configPath: string;
    static LoadConfigAsync(): Promise<void>;
    static ToColor(colorArr: number[]): Vector4;
    static SetParameter(material: Laya.BaseMaterial, prefabName: string): void;
    static SetParameterByCartoon2Material(material: Cartoon2Material, parameter: Cartoon2MaterialParameter): void;
    static SetParameterByDissolveMaterial(material: DissolveMaterial, parameter: Cartoon2MaterialParameter): void;
}
export {};
