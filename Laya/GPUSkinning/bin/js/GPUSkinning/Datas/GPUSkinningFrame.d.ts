import Matrix4x4 = Laya.Matrix4x4;
import Quaternion = Laya.Quaternion;
export default class GPUSkinningFrame {
    matrices: Matrix4x4[];
    rootMotionDeltaPositionQ: Quaternion;
    rootMotionDeltaPositionL: float;
    rootMotionDeltaRotation: Quaternion;
    private rootMotionInvInit;
    private rootMotionInv;
    RootMotionInv(rootBoneIndex: int): Matrix4x4;
    FromBytes(data: ArrayBuffer): void;
    static CreateFromBytes(data: ArrayBuffer): GPUSkinningFrame;
}
