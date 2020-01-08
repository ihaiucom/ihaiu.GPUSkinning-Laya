import BaseTexture = Laya.BaseTexture;
import ShaderDefine = Laya.ShaderDefine;
export declare class GPUSkinningBaseMaterial extends Laya.Material {
    static SHADER_PATH_ROOT: string;
    static getShaderVS(filename: string): string;
    static getShaderPS(filename: string): string;
    static getShaderGLSL(filename: string): string;
    static loadShaderGlslAsync(filename: string): Promise<string>;
    static loadShaderVSAsync(filename: string): Promise<string>;
    static loadShaderPSAsync(filename: string): Promise<string>;
    static loadAsync(path: string, type: string): Promise<any>;
    static GPUSKINING_MATRIX_TEXTURE: number;
    static SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE: ShaderDefine;
    static __initDefine__(): void;
    GPUSkinning_TextureMatrix: BaseTexture;
}
