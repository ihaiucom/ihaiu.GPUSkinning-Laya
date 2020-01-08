import Loader = Laya.Loader;
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
export default class GPUSkining {
    static EXT_SKING_MESH: string;
    static InitAsync(): Promise<void>;
    private static _loadMesh;
    static _onMeshLmLoaded(loader: Loader, lmData: ArrayBuffer): void;
    static resRoot: string;
    static GetAnimName(name: string): string;
    static GetMeshName(name: string): string;
    static GetMatrixTextureName(name: string): string;
    static GetMainTextureName(name: string): string;
    static GetPath(name: string): string;
    static LoadAnimTextureAsync(path: string, width: int, height: int): Promise<any>;
    static LoadAsync(path: string, type?: string): Promise<any>;
    static CreateByNameAsync(name: string, mainTexturePath?: string, materialCls?: any): Promise<GPUSkinningPlayerMono>;
}
