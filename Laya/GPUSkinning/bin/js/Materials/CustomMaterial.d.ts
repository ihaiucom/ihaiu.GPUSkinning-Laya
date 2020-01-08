declare class CustomMaterial extends Laya.BaseMaterial {
    static DIFFUSETEXTURE: number;
    static MARGINALCOLOR: number;
    constructor();
    diffuseTexture: Laya.BaseTexture;
    marginalColor: Laya.Vector3;
}
