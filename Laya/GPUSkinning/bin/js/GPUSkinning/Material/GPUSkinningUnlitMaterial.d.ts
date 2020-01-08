import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;
import BaseTexture = Laya.BaseTexture;
import { GPUSkinningBaseMaterial } from "./GPUSkinningBaseMaterial";
export declare class GPUSkinningUnlitMaterial extends GPUSkinningBaseMaterial {
    static shaderName: string;
    private static _isInstalled;
    static install(): Promise<void>;
    private static initShader;
    static RENDERMODE_OPAQUE: number;
    static RENDERMODE_CUTOUT: number;
    static RENDERMODE_TRANSPARENT: number;
    static RENDERMODE_ADDTIVE: number;
    static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
    static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
    static ALBEDOTEXTURE: number;
    static ALBEDOCOLOR: number;
    static TILINGOFFSET: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    static defaultMaterial: GPUSkinningUnlitMaterial;
    static __initDefine__(): void;
    private _albedoColor;
    private _albedoIntensity;
    private _enableVertexColor;
    _ColorR: number;
    _ColorG: number;
    _ColorB: number;
    _ColorA: number;
    _AlbedoIntensity: number;
    _MainTex_STX: number;
    _MainTex_STY: number;
    _MainTex_STZ: number;
    _MainTex_STW: number;
    _Cutoff: number;
    albedoColorR: number;
    albedoColorG: number;
    albedoColorB: number;
    albedoColorA: number;
    albedoColor: Vector4;
    albedoIntensity: number;
    albedoTexture: BaseTexture;
    tilingOffsetX: number;
    tilingOffsetY: number;
    tilingOffsetZ: number;
    tilingOffsetW: number;
    tilingOffset: Vector4;
    enableVertexColor: boolean;
    renderMode: number;
    depthWrite: boolean;
    cull: number;
    blend: number;
    blendSrc: number;
    blendDst: number;
    depthTest: number;
    constructor();
    clone(): any;
}
