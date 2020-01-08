export default class GPUSkinningPlayerJoint extends Laya.Script3D {
    BoneIndex: int;
    BoneGUID: string;
    private go;
    private transform;
    readonly Transform: Laya.Transform3D;
    readonly GameObject: Laya.Sprite3D;
    onAwake(): void;
    Init(boneIndex: int, boneGUID: string): void;
}
