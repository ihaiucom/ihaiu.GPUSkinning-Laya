import { TestScene } from "./TestSene";
import GPUSkinningPlayerMono from "../GPUSkinning/GPUSkinningPlayerMono";
export default class TestShader {
    scene: TestScene;
    constructor();
    InitAsync(): Promise<void>;
    CloneMono(mono: GPUSkinningPlayerMono, nx?: number, ny?: number): void;
    GetAnimTextureAsync(): Laya.Texture2D;
    LoadAnimTextureAsync(path: string, width: int, height: int): Promise<any>;
    TestGPUSkining(): void;
    TestPrefab(): void;
    TestLoadCube(): Promise<void>;
    static Res3DRoot: string;
    GetPathByResId(resId: string): string;
    loadPrefab(): Promise<void>;
    createRole(res: Laya.Sprite3D): Laya.Sprite3D;
    Load3DAsync(path: string): Promise<any>;
}
