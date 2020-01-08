import { MBaseMaterial } from "./MBaseMaterial";
import ShaderDefine = Laya.ShaderDefine;
export default class PostProcessMaterial extends MBaseMaterial {
    static shaderName: string;
    static defaultMaterial: PostProcessMaterial;
    static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
    static SHADERDEFINE_NORMALMAP: ShaderDefine;
    static SHADERDEFINE_SPECULARMAP: ShaderDefine;
    static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
    static __initDefine__(): void;
    static install(): Promise<void>;
    private static initShader;
    constructor();
}
