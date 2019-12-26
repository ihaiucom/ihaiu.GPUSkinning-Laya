import Matrix4x4 = Laya.Matrix4x4;
import Quaternion = Laya.Quaternion;

/** 烘焙动画--动画剪辑帧数据信息 */
export default class GPUSkinningFrame
{
    /** 矩阵 */
    matrices: Matrix4x4[];

    /** 相对根节点偏移--方向  */
    rootMotionDeltaPositionQ: Quaternion;
    
    /** 相对根节点偏移--距离  */
    rootMotionDeltaPositionL: Quaternion;

    /** 相对根节点偏移 */
    rootMotionDeltaRotation: Quaternion;

    /** 是否根节点初始化逆矩阵 */
    private rootMotionInvInit: boolean = false;
    private rootMotionInv: Matrix4x4;
    /** 根节点逆矩阵 */
    public RootMotionInv(rootBoneIndex: int ):Matrix4x4
    {
        if (!this.rootMotionInvInit)
        {
            let m =  this.matrices[rootBoneIndex];
            this.rootMotionInv = new Matrix4x4();
            m.invert(this.rootMotionInv);
            this.rootMotionInvInit = true;
        }
        return this.rootMotionInv;
    }



}