import { MBaseMaterial } from "./MBaseMaterial";
export declare class SimpleMaterial extends MBaseMaterial {
    static shaderName: string;
    static install(): Promise<void>;
    private static initShader;
    static DIFFUSETEXTURE: number;
    static MARGINALCOLOR: number;
    constructor();
    diffuseTexture: Laya.BaseTexture;
    marginalColor: Laya.Vector3;
}
