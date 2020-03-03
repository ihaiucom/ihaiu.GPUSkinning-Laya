import Matrix4x4 = Laya.Matrix4x4;
import ByteReadUtil from "./ByteReadUtil";
/** 烘焙动画--骨骼节点信息 */
export default class GPUSkinningBone
{
    /** 编号 */
    guid: string;

    /** 名称 */
    name: string;

    /** 是否导出 */
    isExposed: boolean;

    /** 矩阵 */
    bindpose: Matrix4x4;

    /** 索引 */
    boneIndex: int = -1;

    /** 父节点索引 */
    parentBoneIndex: int = -1;

    /** 子节点索引 */
    childrenBonesIndices: int[];

    /** 是否生成了逆矩阵 */
    private _bindposeInvInit = false;

    private _bindposeInv: Matrix4x4;
    /** 逆矩阵 */
    public get BindposeInv(): Matrix4x4
    {
        if(!this._bindposeInv)
        {
            this._bindposeInv = new Matrix4x4();
            this.bindpose.invert(this._bindposeInv);
            this._bindposeInvInit = true;
        }
        return this._bindposeInv;
    }
    
    FromBytes(data: ArrayBuffer): void
    {
        var b:Laya.Byte = new Laya.Byte(data);
        this.name = b.readUTFString();
        this.guid = b.readUTFString();
        this.isExposed = b.readByte() != 0;
        this.boneIndex = b.readInt32();
        this.parentBoneIndex = b.readInt32();
        this.bindpose = ByteReadUtil.ReadMatrix4x4(b);

    }

    static CreateFromBytes(data: ArrayBuffer):GPUSkinningBone
    {
        var obj = new GPUSkinningBone();
        obj.FromBytes(data);
        return obj;
    }


}