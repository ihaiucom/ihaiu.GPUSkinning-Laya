import GPUSkinningBone from "./GPUSkinningBone";
import GPUSkinningClip from "./GPUSkinningClip";
import { GPUSkinningQuality } from "./GPUSkinningQuality";

import Byte = Laya.Byte;
import ByteReadUtil from "./ByteReadUtil";

/** 烘焙动画--全部数据信息 */
export default class GPUSkinningAnimation extends Laya.Resource
{
    version:string;
    /** 编号 */
    guid: string;

    /** 名称 */
    name: string;

    bonesCount = 67;

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

    FromBytes(arrayBuffer: ArrayBuffer): void
    {
        
        // var b:Byte = new Byte(arrayBuffer);
        // b.pos = 0;
        // var vision = b.readUTFString();
        // var len = b.readUint32();
        // var arrayBuffer = arrayBuffer.slice(b.pos, pos + len);

        var b:Byte = new Byte(arrayBuffer);
        b.pos = 0;

        this.guid = b.readUTFString();
        this.name = b.readUTFString();
        this.rootBoneIndex = b.readInt16();
        this.textureWidth = b.readUint32();
        this.textureHeight = b.readUint32();
        this.sphereRadius = b.readFloat32();
        this.skinQuality = <GPUSkinningQuality> b.readInt32();
        this.bonesCount = b.readUint32();
        this.bounds = ByteReadUtil.ReadBounds(b);

        
        // 剪辑列表 数量
        var clipCount = b.readUint32();
        // 骨骼列表 数量
        var boneCount = b.readUint32();


        // 剪辑列表 头信息
        var clipPosLengthList:int[][] = [];
        for(var i = 0; i < clipCount; i ++)
        {
            var info = [];
            info[0] = b.readUint32(); // posBegin
            info[1] = b.readUint32(); // length
            clipPosLengthList.push(info);
        }


        // 骨骼列表 头信息
        var bonePosLengthList:int[][] = [];
        for(var i = 0; i < boneCount; i ++)
        {
            var info = [];
            info[0] = b.readUint32(); // posBegin
            info[1] = b.readUint32(); // length
            bonePosLengthList.push(info);
        }

        
        // 剪辑列表 数据块
        var clipList: GPUSkinningClip[] = [];
        this.clips = clipList;
        for(var i = 0; i < clipCount; i ++)
        {
            var itemInfo:int[] = clipPosLengthList[i];
            var pos = itemInfo[0];
            var len = itemInfo[1];

            b.pos = pos;

            var itemBuffer = b.readArrayBuffer(len);
            var item:any = GPUSkinningClip.CreateFromBytes(itemBuffer);
            clipList.push(item);
        }

        
        // 骨骼列表 数据块
        var boneList: GPUSkinningBone[] = [];
        this.bones = boneList;
        for(var i = 0; i < boneCount; i ++)
        {
            var itemInfo:int[] = bonePosLengthList[i];
            var pos = itemInfo[0];
            var len = itemInfo[1];

            b.pos = pos;
            b.pos = pos;
            var itemBuffer = b.readArrayBuffer(len);
            var item:any = GPUSkinningBone.CreateFromBytes(itemBuffer);
            boneList.push(item);
        }

    }

    static CreateFromBytes(data: ArrayBuffer):GPUSkinningAnimation
    {
        
        var b:Byte = new Byte(data);
        b.pos = 0;
        var version = b.readUTFString();
        var len = b.readUint32();
        var arrayBuffer = b.readArrayBuffer(len);

        var obj = new GPUSkinningAnimation();
        obj.version = version;
        obj.FromBytes(arrayBuffer);
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
        Laya.loader.load(path, Laya.Handler.create(this, (data: ArrayBuffer | GPUSkinningAnimation)=>
        {

            if(data == null)
            {
                console.error("加载资源失败" , path);
                callback(null);
                return;
            }
            
            var anim: GPUSkinningAnimation;
            if(data instanceof ArrayBuffer)
            {
                anim = GPUSkinningAnimation.CreateFromBytes(data);
                anim._url = Laya.URL.formatURL(path);
                Laya.Loader.clearRes(path);
                Laya.Loader.cacheRes(path, anim);
            }
            else
            {
                anim = data;
            }

            if(callback)
            {
                callback(anim);
            }
        }), null, Laya.Loader.BUFFER)
    }

    protected _disposeResource(): void 
    {
		super._disposeResource();
    }
    
    
	/**
	 * 销毁资源,销毁后资源不能恢复。
	 */
	destroy(): void {
		// console.log("destroy GPUSkinningAnimation", this._url);
		super.destroy();
	}
    

}