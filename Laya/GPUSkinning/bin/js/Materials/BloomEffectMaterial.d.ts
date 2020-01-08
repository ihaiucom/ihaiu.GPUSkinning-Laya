import { MBaseMaterial } from "./MBaseMaterial";
export default class BloomEffectMaterial extends MBaseMaterial {
    static shaderName: string;
    static defaultMaterial: BloomEffectMaterial;
    static __initDefine__(): void;
    static install(): Promise<void>;
    private static initShader;
    static COLOR_THRESHOLD: number;
    static GAUSSIAN_OFFSET: number;
    static MAINTEXEL_SIZE: number;
    static BLOOM_COLOR: number;
    static BLOOM_FACTOR: number;
    constructor();
    colorThreshold: laya.d3.math.Vector4;
    gaussianOffset: laya.d3.math.Vector4;
    mainTexelSize: laya.d3.math.Vector4;
    bloomColor: laya.d3.math.Vector4;
    bloomFactor: number;
}
