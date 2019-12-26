import GPUSkinningBone from "./GPUSkinningBone";
import GPUSkinningClip from "./GPUSkinningClip";
import { GPUSkinningQuality } from "./GPUSkinningQuality";

/** 烘焙动画--全部数据信息 */
export default class GPUSkinningAnimation
{
    /** 编号 */
    guid: string;

    /** 名称 */
    name: string;

    /** 骨骼列表 */
    bones: GPUSkinningBone[];

    /** 根骨骼 */
    rootBoneIndex: int = 0;

    /** 动作列表 */
    clips: GPUSkinningClip[];

    /** 盒子大小 */
    bounds: Laya.Bounds;

    /** 动作贴图宽 */
    textureWidth: number = 0;

    /** 动作贴图高 */
    textureHeight: number = 0;

    /** lod模式 距离列表 */
    lodDistances: float[];

    /** lod模式 Mesh列表 */
    lodMeshes: Laya.Mesh[];
    
    /** 裁剪用 CullingBounds */
    sphereRadius: float = 1.0;

    /** 骨骼品质 */
    skinQuality:GPUSkinningQuality = GPUSkinningQuality.Bone4;

}