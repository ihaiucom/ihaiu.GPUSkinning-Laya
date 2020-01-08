export declare class MBaseMaterial extends Laya.Material {
    static SHADER_PATH_ROOT: string;
    static getShaderVS(filename: string): string;
    static getShaderPS(filename: string): string;
    static loadShaderVSAsync(filename: string): Promise<string>;
    static loadShaderPSAsync(filename: string): Promise<string>;
    static loadAsync(path: string, type: string): Promise<any>;
}
