import GPUSkinningBone from "./GPUSkinningBone";
import GPUSkinningClip from "./GPUSkinningClip";
import { GPUSkinningQuality } from "./GPUSkinningQuality";

import Byte = Laya.Byte;

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

    FromBytes(data: ArrayBuffer): void
    {
        var b:Byte = new Byte(data);
        this.guid = b.readUTFString();
        this.name = b.readUTFString();
        this.rootBoneIndex = b.readInt16();

    }

    static CreateFromBytes(data: ArrayBuffer):GPUSkinningAnimation
    {
        var obj = new GPUSkinningAnimation();
        obj.FromBytes(data);
        return obj;
    }


    static async LoadAsync(path: string):Promise<GPUSkinningAnimation>
    {
        return new Promise<GPUSkinningAnimation>((resolve)=>
        {
            this.Load(path, (anim: GPUSkinningAnimation)=>
            {
                resolve(anim);
            });
        });

    }

    
    static Load(path: string, callback:(  (anim: GPUSkinningAnimation) => any)  ):void
    {
        Laya.loader.load(path, Laya.Handler.create(this, (data: ArrayBuffer)=>
        {
            var obj = GPUSkinningAnimation.CreateFromBytes(data);
            if(callback)
            {
                callback(obj);
            }
        }), null, Laya.Loader.BUFFER)
    }

}