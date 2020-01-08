export default class MultiplePassOutlineMaterial extends Laya.BaseMaterial {
    static ALBEDOTEXTURE: number;
    static MARGINALCOLOR: number;
    static OUTLINETEXTURE: number;
    static OUTLINEWIDTH: number;
    static OUTLINELIGHTNESS: number;
    static OUTLINECOLOR: number;
    static shaderDefines: Laya.ShaderDefines;
    static __init__(): void;
    albedoTexture: Laya.BaseTexture;
    outlineColor: any;
    outlineWidth: number;
    outlineLightness: number;
    static initShader(): void;
    constructor();
}
