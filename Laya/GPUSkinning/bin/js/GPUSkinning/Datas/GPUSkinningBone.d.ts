import Matrix4x4 = Laya.Matrix4x4;
export default class GPUSkinningBone {
    guid: string;
    name: string;
    isExposed: boolean;
    bindpose: Matrix4x4;
    parentBoneIndex: int;
    childrenBonesIndices: int[];
    private _bindposeInvInit;
    private _bindposeInv;
    readonly BindposeInv: Matrix4x4;
    FromBytes(data: ArrayBuffer): void;
    static CreateFromBytes(data: ArrayBuffer): GPUSkinningBone;
}
