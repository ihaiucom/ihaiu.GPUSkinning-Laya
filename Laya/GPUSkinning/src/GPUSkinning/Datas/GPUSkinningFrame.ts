import Matrix4x4 = Laya.Matrix4x4;
import Quaternion = Laya.Quaternion;
import ByteReadUtil from "./ByteReadUtil";

/** 烘焙动画--动画剪辑帧数据信息 */
export default class GPUSkinningFrame
{
    /** 矩阵 */
    matrices: Matrix4x4[];

    /** 相对根节点偏移--方向  */
    rootMotionDeltaPositionQ: Quaternion;
    
    /** 相对根节点偏移--距离  */
    rootMotionDeltaPositionL: float;

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

    
    FromBytes(data: ArrayBuffer, rootMotionEnabled:boolean): void
    {
        var b:Laya.Byte = new Laya.Byte(data);
        if(rootMotionEnabled)
        {
            this.rootMotionDeltaPositionL = b.readFloat32();
            this.rootMotionDeltaPositionQ = ByteReadUtil.ReadQuaternion(b);
            this.rootMotionDeltaRotation = ByteReadUtil.ReadQuaternion(b);
        }

        var matricesCount = b.readUint32();
        this.matrices = [];
        for(var i = 0; i < matricesCount; i ++)
        {
            var m = ByteReadUtil.ReadMatrix4x4(b);
            this.matrices.push(m);
        }
        

    }

    static CreateFromBytes(data: ArrayBuffer, rootMotionEnabled:boolean):GPUSkinningFrame
    {
        var obj = new GPUSkinningFrame();
        obj.FromBytes(data, rootMotionEnabled);
        return obj;
    }



}