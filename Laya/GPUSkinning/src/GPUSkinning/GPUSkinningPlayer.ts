import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningClip from "./Datas/GPUSkinningClip";
import { GPUSKinningCullingMode } from "./GPUSKinningCullingMode";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkinningWrapMode } from "./Datas/GPUSkinningWrapMode";
import GPUSkinningMaterial from "./GPUSkinningMaterial";
import GPUSkinningBone from "./Datas/GPUSkinningBone";
import { MaterialState } from "./MaterialState";
import GPUSkinningFrame from "./Datas/GPUSkinningFrame";

import MeshRenderer = Laya.MeshRenderer;
import MeshFilter = Laya.MeshFilter;
import Vector3 = Laya.Vector3;
import Vector4 = Laya.Vector4;
import Mesh = Laya.Mesh;
import Matrix4x4 = Laya.Matrix4x4;
import Quaternion = Laya.Quaternion;
import Transform3D = Laya.Transform3D;


import GPUSkinningAnimEvent from "./Datas/GPUSkinningAnimEvent";
import GPUSkining from "./GPUSkining";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import { GPUSkinningToonV2Material } from "./Material/GPUSkinningToonV2";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";

/** GPU骨骼动画--组件播放控制器 */
export default class GPUSkinningPlayer
{
    __mname:string;
    private go: Laya.MeshSprite3D;
    private transform: Laya.Transform3D;
    private mr: MeshRenderer;
    private mf: MeshFilter;
    private spriteShaderData: Laya.ShaderData;

    private time: float = 0;
    private timeDiff: float = 0;
    private crossFadeTime: float = -1;
    private crossFadeProgress: float = 0;
    private lastPlayedTime: float = 0;
    private lastPlayedClip:GPUSkinningClip = null;
    private lastPlayingFrameIndex: int = -1;
    private lastPlayingClip: GPUSkinningClip = null;
    private playingClip: GPUSkinningClip = null;


    private nextFrameIndex: int = -1;
    private nextLerpProgress: float = 0;


    private res: GPUSkinningPlayerResources = null;
    private rootMotionFrameIndex:int = -1;

    private _speed: float = 1;
    
    public get speed(): float
    {
        return this._speed;
    }

    public set speed(value: float)
    {
        this._speed = value;
        this.SetWeapSpeed(value);
    }
    /** 动画事件 */
    sAnimEvent:Typed2Signal<GPUSkinningPlayer, int> = new Typed2Signal<GPUSkinningPlayer, int>();

    /** 根节点是否驱动位移 */
    private rootMotionEnabled: boolean = false;
    public get RootMotionEnabled(): boolean
    {
        return this.rootMotionEnabled;
    }

    public set RootMotionEnabled(value: boolean)
    {
        this.rootMotionFrameIndex = -1;
        this.rootMotionEnabled = value;
    }


    /** 裁剪模式 */
    private cullingMode: GPUSKinningCullingMode = GPUSKinningCullingMode.CullUpdateTransforms;
    public get CullingMode():GPUSKinningCullingMode
    {
        return this.cullingMode;
    }

    public set CullingMode(value: GPUSKinningCullingMode)
    {
        this.cullingMode = value;
    }

    /** 是否显示 */
    private visible: boolean = true;
    public get Visible(): boolean
    {
        return this.visible;
    }

    public set Visible(value: boolean)
    {
        this.visible = value;
    }

    /** LOD 模式是否开启 */
    private lodEnabled: boolean = false;
    public get LODEnabled()
    {
        return this.lodEnabled;
    }

    public set LODEnabled(value: boolean)
    {
        this.lodEnabled = value;
        this.res.LODSettingChanged(this);
    }

    /** 是否播放 */
    private isPlaying: boolean = false;
    public get IsPlaying(): boolean
    {
        return this.isPlaying;
    }

    /** 当前播放的动画剪辑名称 */
    public get PlayingClipName():string
    {
        return this.playingClip == null ? null : this.playingClip.name;
    }

    /** 世界坐标 */
    public get Position():Vector3
    {
        return this.transform == null ? new Vector3() : this.transform.position;
    }

    /** 局部坐标 */
    public get LocalPosition():Vector3
    {
        return this.transform == null ? new Vector3() : this.transform.localPosition;
    }

    /** 骨骼列表 */
    private jointMap: Map<string, GPUSkinningPlayerJoint> = new Map<string, GPUSkinningPlayerJoint>();
    private joints: GPUSkinningPlayerJoint[]  = null;
    public get Joints(): GPUSkinningPlayerJoint[]
    {
        return this.joints;
    }

    /** 播放模式，单次或者循环 */
    public get WrapMode(): GPUSkinningWrapMode
    {
        return this.playingClip == null ? GPUSkinningWrapMode.Once : this.playingClip.wrapMode;
    }

    /** 动画剪辑时间长度 */
    public get ClipTimeLength(): float
    {
        if(!this.playingClip)
        {
            return 0;
        }
        
        return this.playingClip.length;
    }

    /** 是否是动作结束帧 */
    public get IsTimeAtTheEndOfLoop(): boolean
    {
        if(this.playingClip == null)
        {
            return false;
        }
        else
        {
            return this.GetFrameIndex() == (Math.floor(this.playingClip.length * this.playingClip.fps) - 1);
        }

    }

    /** 播放进度百分比 */
    public get NormalizedTime(): float
    {
        if(this.playingClip == null)
        {
            return 0;
        }
        else
        {
            return this.GetFrameIndex() / (Math.floor(this.playingClip.length * this.playingClip.fps) - 1);
        }
    }

    public set NormalizedTime(value: float)
    {
        if(this.playingClip != null)
        {
            var v = Mathf.Clamp01(value);
            
            if(this.WrapMode == GPUSkinningWrapMode.Once)
            {
                this.time = v * this.playingClip.length;
            }
            else if(this.WrapMode == GPUSkinningWrapMode.Loop)
            {
                // if(this.playingClip.individualDifferenceEnabled)
                // {
                //     this.res.Time = this.playingClip.length + v * this.playingClip.length - this.timeDiff;
                // }
                // else
                // {
                //     this.res.Time = v * this.playingClip.length;
                // }
                
                this.time = v * this.playingClip.length;
            }
            else
            {
                console.error(`GPUSkinningPlayer.NormalizedTime 未知 播放模式 WrapMode=${this.WrapMode}`);
            }
        }
    }

    /** 获取当前时间 */
    private GetCurrentTime(): float
    {
        let time = 0;
        switch(this.WrapMode)
        {
            case GPUSkinningWrapMode.Once:
                time = this.time;
                break;
            case GPUSkinningWrapMode.Loop:
                time = this.time;
                // time = this.res.Time + (this.playingClip.individualDifferenceEnabled ? this.timeDiff : 0);
                break;
            default:
                console.error(`GPUSkinningPlayer.GetCurrentTime 未知 播放模式 WrapMode=${this.WrapMode}`);
                break;
        }

        return time;
    }


    __frameIndex:int = 0;
    /** 获取当前帧 */
    private GetFrameIndex(): int
    {
        let time = this.GetCurrentTime();
        if(this.playingClip.length == time)
        {
            return this.GetTheLastFrameIndex_WrapMode_Once(this.playingClip);
        }
        else
        {
            return this.GetFrameIndex_WrapMode_Loop(this.playingClip, time);
        }
    }

    /** 获取下一帧 */
    private GetNextFrameIndex(currentFrameIndex:int): int
    {
        var frameIndex = currentFrameIndex;
        var frameEnd = Math.floor(this.playingClip.length * this.playingClip.fps) - 1;
        if(frameIndex == frameEnd)
        {
            switch(this.WrapMode)
            {
                case GPUSkinningWrapMode.Once:
                    frameIndex = frameEnd;
                    break;
                case GPUSkinningWrapMode.Loop:
                    frameIndex = 0;
                    break;
                default:
                    console.error(`GPUSkinningPlayer.GetNextFrameIndex 未知 播放模式 WrapMode=${this.WrapMode}`);
                    break;
            }
        }
        else
        {
            frameIndex ++;
        }
        return frameIndex;

    }

    /** 获取动画过度帧 */
    private GetCrossFadeFrameIndex(): int
    {
        if(this.lastPlayedClip == null)
        {
            return 0;
        }

        switch(this.lastPlayedClip.wrapMode)
        {
            case GPUSkinningWrapMode.Once:
                if(this.lastPlayedTime >= this.lastPlayedClip.length)
                {
                    return this.GetTheLastFrameIndex_WrapMode_Once(this.lastPlayedClip);
                }
                else
                {
                    return this.GetFrameIndex_WrapMode_Loop(this.lastPlayedClip, this.lastPlayedTime);
                }
                break;

            case GPUSkinningWrapMode.Loop:
                return this.GetFrameIndex_WrapMode_Loop(this.lastPlayedClip, this.lastPlayedTime);
                break;

            default:
                console.error(`GPUSkinningPlayer.GetCrossFadeFrameIndex 未知 播放模式 this.lastPlayedClip.wrapMode=${this.lastPlayedClip.wrapMode}`);
                break;
        }

    }


    /** 获取动画剪辑最后一帧索引 */
    private GetTheLastFrameIndex_WrapMode_Once(clip: GPUSkinningClip ):int
    {
        return clip.frameLastIndex;
        // return Math.floor(clip.length * clip.fps) - 1;
    }

    /** 获取动画剪辑帧索引 */
    private  GetFrameIndex_WrapMode_Loop(clip: GPUSkinningClip , time: float ):int
    {
        return Math.floor(time * clip.fps) % Math.floor(clip.length * clip.fps);
    }

    /** 获取当前材质 */
    private GetCurrentMaterial():GPUSkinningMaterial
    {
        if(this.res == null)
        {
            return null;
        }

        if(this.playingClip == null)
        {
            return this.res.GetMaterial(MaterialState.RootOff_BlendOff);
        }

        let res = this.res;
        let playingClip = this.playingClip;
        let lastPlayedClip = this.lastPlayedClip;
        let rootMotionEnabled = this.rootMotionEnabled;
        let crossFadeTime = this.crossFadeTime;
        let crossFadeProgress = this.crossFadeProgress;

        if(playingClip.rootMotionEnabled && rootMotionEnabled)
        {
            if(res.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress))
            {
                if(lastPlayedClip.rootMotionEnabled)
                {
                    return res.GetMaterial(MaterialState.RootOn_BlendOn_CrossFadeRootOn);
                }
                return res.GetMaterial(MaterialState.RootOn_BlendOn_CrossFadeRootOff);
            }
            return res.GetMaterial(MaterialState.RootOn_BlendOff);
        }

        if(res.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress))
        {
            if(lastPlayedClip.rootMotionEnabled)
            {
                return res.GetMaterial(MaterialState.RootOff_BlendOn_CrossFadeRootOn);
            }
            return res.GetMaterial(MaterialState.RootOff_BlendOn_CrossFadeRootOff);
        }
        else
        {
            return res.GetMaterial(MaterialState.RootOff_BlendOff);
        }

    }


    /** 设置LOD网格 */
    public SetLODMesh(mesh: Mesh )
    {
        if(!this.LODEnabled)
        {
            mesh = this.res.mesh;
        }

        if(this.mf != null && this.mf.sharedMesh != mesh)
        {
            this.mf.sharedMesh = mesh;
        }
    }

    private mtrl: GPUSkinningMaterial;

    get material(): GPUSkinningBaseMaterial
    {
        return <any>this.mtrl.material;
    }



    static _ShaderUID = 0;
    constructor(go: Laya.MeshSprite3D, res: GPUSkinningPlayerResources)
    {
        this.go = go;
        this.transform = go.transform;
        this.res = res;

        this.mr = go.meshRenderer;
        this.mf = go.meshFilter;
        this.spriteShaderData = go.meshRenderer._shaderValues;
        go.meshRenderer['__id']  = this.spriteShaderData['__id'] = GPUSkinningPlayer._ShaderUID ++;

        let mtrl: GPUSkinningMaterial = this.GetCurrentMaterial();
        this.mtrl = mtrl;
        var mtrl2 = new GPUSkinningMaterial();
        mtrl2.material =  res.CloneMaterial(<any>mtrl.material, res.anim.skinQuality)
        mtrl = mtrl2;
        this.mtrl = mtrl2;
        this.mr.sharedMaterial = mtrl == null ? null : mtrl.material;
        this.mf.sharedMesh = res.mesh;
        var subMeshCount = this.mf.sharedMesh.subMeshCount;
        if(subMeshCount > 1)
        {
            var matrices = [mtrl.material];
            for(var i = 1; i < subMeshCount; i ++)
            {
                var m:GPUSkinningToonV2Material = mtrl.material.clone();
                // m.albedoColor = new Laya.Vector4(1, 0, 0, 1);
                matrices.push(m);
            }
            this.mr.sharedMaterials =  matrices;
        }



        this.ConstructJoints();
    }

    
    onDestroy():void
    {
        if( this.mtrl)
        {
            this.mtrl.Destroy();
            this.mtrl = null;
        }
    }

    /** 构建骨骼节点 */
    private ConstructJoints()
    {
        if(this.joints)
            return;


        
        this.jointMap.clear();
        let existingJoints: GPUSkinningPlayerJoint[] = this.go.getComponentsInChildren<GPUSkinningPlayerJoint>(GPUSkinningPlayerJoint);

        let bones: GPUSkinningBone[] = this.res.anim.bones;
        let numBones = bones == null ? 0 : bones.length;
        for(let i = 0; i < numBones; i ++)
        {
            let bone = bones[i];
            if(!bone.isExposed)
            {
                continue;
            }

            if(this.joints == null)
            {
                this.joints = [];
            }

            let joints =  this.joints;

            // 是否从已经存在的骨骼节点设置了
            let inTheExistingJoints: boolean = false;

            if(existingJoints != null)
            {
                for(let j = 0; j < existingJoints.length; j ++)
                {
                    let existingJoint = existingJoints[j];
                    if(existingJoint)
                    {
                        for(var ii = existingJoint.owner.numChildren - 1; ii >= 0; ii --)
                        {
                            GPUSkinningPlayer.RecoverWeaponItem(<Laya.Sprite3D>existingJoint.owner.getChildAt(ii));
                        }
                    }
                    
                    if(existingJoint && existingJoint.BoneGUID == bone.guid)
                    {
                        if(existingJoint.index != i)
                        {
                            existingJoint.Init(bone, i, bone.boneIndex, bone.guid);
                        }

                        existingJoint.GameObject.name = bone.name;
                        joints.push(existingJoint);
                        this.jointMap.set(bone.name, existingJoint);
                        existingJoints[j] = null; 
                        inTheExistingJoints = true;
                        break;
                    }
                }
            }

            if(!inTheExistingJoints)
            {
                let joinGO = new Laya.Sprite3D(bone.name);
                this.go.addChild(joinGO);
                joinGO.transform.localPosition = new Vector3();
                joinGO.transform.localScale = new Vector3(1, 1, 1);

                let join:GPUSkinningPlayerJoint = joinGO.addComponent(GPUSkinningPlayerJoint);
                join.onAwake();
                joints.push(join);
                join.Init(bone, i, bone.boneIndex, bone.guid);
                
                this.jointMap.set(bone.name, join);
            }
        }

        // 清除没用到已经存在的骨骼节点
        this.DeleteInvalidJoints(existingJoints);

    }


    /** 清除没用到已经存在的骨骼节点 */
    private DeleteInvalidJoints(joints: GPUSkinningPlayerJoint[] )
    {
        if(joints)
        {
            for(let i = 0; i < joints.length; i ++)
            {
                let join = joints[i];
                if(!join)
                    continue;

                let joinGO = <Laya.Sprite3D> join.owner;
                for(let j = joinGO.numChildren -1; j >= 0 ; j --)
                {
                    let child =  <Laya.Sprite3D> joinGO.getChildAt(j);
                    this.go.addChild(child);
                    child.transform.localPosition = new Vector3();
                }

                joinGO.removeSelf();
                joinGO.destroy();
                if(join.bone)
                {
                    this.jointMap.delete(join.bone.name);
                }

            }
        }
    }

    /** 查找导出的骨骼节点 */
    public FindJoint(boneName: string):GPUSkinningPlayerJoint
    {
        if(this.jointMap.has(boneName))
        {
            return this.jointMap.get(boneName);
        }
        return null;
    }
    
    /** 查找导出的骨骼节点GameObject */
    public FindJointGameObject(boneName: string):Laya.Sprite3D
    {
        var joint = this.FindJoint(boneName);
        if(joint)
        {
            return joint.GameObject;
        }
        else
        {
            var joinGameObject:Laya.Sprite3D;
            this.weaponMap.forEach((v, k)=>{
                joinGameObject = v.Player.FindJointGameObject(boneName);
                if(joinGameObject)
                {
                    return joinGameObject;
                }
            })
            return joinGameObject;
        }
    }

    public GotoAndStop(clipName:string, nomrmalizeTime : number = 0)
    {
        this.Play(clipName, nomrmalizeTime);
        this.Stop();
    }

    /** 播放 */
    public Play(clipName:string, nomrmalizeTime : number = 0)
    {
        clipName = clipName.toLowerCase();
        let clips: GPUSkinningClip[] = this.res.anim.clips;
        let numClips = clips == null ? 0 : clips.length;

        let playingClip = this.playingClip;
        for(let i = 0; i < numClips; ++i)
        {
            if(clips[i].name == clipName)
            {
                let item = clips[i];
                if(playingClip != item
                    || (playingClip != null && playingClip.wrapMode == GPUSkinningWrapMode.Once && this.IsTimeAtTheEndOfLoop)
                    || (playingClip != null && !this.isPlaying)
                )
                {
                    this.SetNewPlayingClip(item, nomrmalizeTime);
                }
                
                this.time = nomrmalizeTime * item.length;
                return;
            }
        }
    }

    /** 播放动作融合 */
    public CrossFade(clipName: string, fadeLength: float, nomrmalizeTime: number = 0)
    {
        this.Play(clipName, nomrmalizeTime);
        return;

        if(this.playingClip == null)
        {
            this.Play(clipName, nomrmalizeTime);
        }
        else
        {
            let playingClip = this.playingClip;

            let clips: GPUSkinningClip[] = this.res.anim.clips;
            let numClips = clips == null ? 0 : clips.length;
            for(let i = 0; i < numClips; ++i)
            {
                if(clips[i].name == clipName)
                {
                    let item = clips[i];

                    if(playingClip != item)
                    {
                        this.crossFadeProgress = nomrmalizeTime;
                        this.crossFadeTime = fadeLength;
                        this.SetNewPlayingClip(item, nomrmalizeTime);
                        return;
                    }

                    if(
                        (playingClip != null && playingClip.wrapMode == GPUSkinningWrapMode.Once && this.IsTimeAtTheEndOfLoop)
                        || (playingClip != null && !this.isPlaying)
                    )
                    {
                        this.SetNewPlayingClip(item, nomrmalizeTime);
                        return;
                    }
                }
            }

        }


    }


    /** 设置新播放的剪辑 */
    private SetNewPlayingClip(clip: GPUSkinningClip, nomrmalizeTime: number = 0)
    {
        this.lastPlayedClip = this.playingClip;
        this.lastPlayedTime = this.GetCurrentTime();

        this.isPlaying = true;
        this.playingClip = clip;
        this.rootMotionFrameIndex = -1;
        this.time = nomrmalizeTime * clip.length;
        this.timeDiff = Random.range(0, clip.length);
        this.SetWeapClip(clip.name, nomrmalizeTime, this.timeDiff);
    }


    /** 暂停 */
    public Stop()
    {
        // this.isPlaying = false;
        this.speed = 0;
    }

    /** 继续播放 */
    public Resume()
    {
        if(this.playingClip != null)
        {
            // this.isPlaying = true;
            this.speed = 1;
        }
    }


    isRandomPlayClip: boolean = false;
    randomPlayClipI = 0;

    /** 刷新入口 每帧调用 */
    public Update(timeDelta: float)
    {
        if(!this.isPlaying || this.playingClip == null)
        {
            return;
        }
        this.TweenSpeedUpdate();
        timeDelta *= this.speed;

        if(this.isRandomPlayClip)
        {
            this.randomPlayClipI ++;
            if(this.randomPlayClipI >= Random.range(100, 500))
            {
                this.randomPlayClipI = 0;
                var i = Random.range(0, this.res.anim.clips.length);
                i = Math.floor(i);
                this.Play(this.res.anim.clips[i].name);
            }
        }

        let currMtrl = this.mtrl;
        // let currMtrl = this.GetCurrentMaterial();
        // if(currMtrl == null)
        // {
        //     return;
        // }

        // if(this.mr.sharedMaterial != currMtrl.material)
        // {
        //     this.mr.sharedMaterial = currMtrl.material;
        // }

        let playingClip = this.playingClip;

        switch(playingClip.wrapMode)
        {
            case GPUSkinningWrapMode.Loop:
                this.UpdateMaterial(timeDelta, currMtrl);
                this.time += timeDelta;
                break;

            case GPUSkinningWrapMode.Once:
                if(this.time >= playingClip.length)
                {
                    this.time = playingClip.length;
                    this.UpdateMaterial(timeDelta, currMtrl);
                }
                else
                {
                    this.UpdateMaterial(timeDelta, currMtrl);
                    this.time += timeDelta;
                    if(this.time > playingClip.length || this.__frameIndex == this.GetTheLastFrameIndex_WrapMode_Once(this.playingClip))
                    {
                        this.time = playingClip.length;
                    }
                }
                break;
            default:
                console.error(`GPUSkinningPlayer.Update 未知 播放模式 playingClip.wrapMode=${playingClip.wrapMode}`);
                break;

        }

        this.crossFadeProgress += timeDelta;
        this.lastPlayedTime += timeDelta;

        
        this.lastPlayingClip = this.playingClip;
        this.lastPlayingFrameIndex = this.__frameIndex;

        this.nextFrameIndex = this.__frameIndex;
        this.nextLerpProgress += timeDelta;

    }

    
    
    onRenderUpdate(context: Laya.RenderContext3D, transform: Laya.Transform3D, render:Laya.MeshRenderer)
    {
        console.log(render['__id'], "onRenderUpdate");
        // render._shaderValues.setVector( GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation, new Vector4(this.__frameIndex, this.playingClip.pixelSegmentation, 0, 0));

    }



    private UpdateMaterial(deltaTime: float , currMtrl: GPUSkinningMaterial )
    {
        let res = this.res;
        let frameIndex = this.GetFrameIndex();
        this.__frameIndex = frameIndex;
        // if(this.speed == 0)
        // {
        //     this.nextFrameIndex = this.__frameIndex;
        // }
        // else
        {
            this.nextFrameIndex = this.GetNextFrameIndex(frameIndex);
        }
        
        if(this.lastPlayingClip == this.playingClip && this.lastPlayingFrameIndex == frameIndex)
        {
            // res.Update(deltaTime, currMtrl);
            // return;
        }
        else
        {
            this.nextLerpProgress = 0;
        }



        let lastPlayedClip = this.lastPlayingClip;
        let playingClip = this.playingClip;

        let blend_crossFade:float = 1;
        let frameIndex_crossFade:int = -1;
        let frame_crossFade: GPUSkinningFrame  = null;
        if (res.IsCrossFadeBlending(lastPlayedClip, this.crossFadeTime, this.crossFadeProgress))
        {
            frameIndex_crossFade = this.GetCrossFadeFrameIndex();
            frame_crossFade = lastPlayedClip.frames[frameIndex_crossFade];
            blend_crossFade = res.CrossFadeBlendFactor(this.crossFadeProgress, this.crossFadeTime);
        }

        let nextFrameFade = res.CrossFadeBlendFactor(this.nextLerpProgress, playingClip.fps * 0.001);
        // if(nextFrameFade != 0)
        // {
        //     nextFrameFade = 0.5;
        // }

        var mpb = currMtrl.material._shaderValues;

        let frame: GPUSkinningFrame = playingClip.frames[frameIndex];
        let nextFrame: GPUSkinningFrame = playingClip.frames[this.nextFrameIndex];
        if (this.Visible || 
            this.CullingMode == GPUSKinningCullingMode.AlwaysAnimate)
        {
            res.Update(deltaTime, currMtrl);
            res.UpdatePlayingData(
                mpb, this.spriteShaderData, 
                playingClip, frameIndex, 
                this.nextFrameIndex, nextFrameFade,
                frame,  playingClip.rootMotionEnabled && this.rootMotionEnabled,
                lastPlayedClip, this.GetCrossFadeFrameIndex(), this.crossFadeTime, this.crossFadeProgress
            );

            // this.mr.SetPropertyBlock(mpb);
            this.UpdateJoints(frame, nextFrame, nextFrameFade);
        }

        if (playingClip.rootMotionEnabled && this.rootMotionEnabled && frameIndex != this.rootMotionFrameIndex)
        {
            if (this.CullingMode != GPUSKinningCullingMode.CullCompletely)
            {
                this.rootMotionFrameIndex = frameIndex;
                this.DoRootMotion(frame_crossFade, 1 - blend_crossFade, false);
                this.DoRootMotion(frame, blend_crossFade, true);
            }
        }
        

        this.UpdateEvents(playingClip, frameIndex, frame_crossFade == null ? null : lastPlayedClip, frameIndex_crossFade);

    }

    
    private _tmp_p = new Vector3();
    private _tmp_r = new Quaternion();
    private _tmp_s = new Vector3();
    private _tmp_jointMatrix = new Matrix4x4();
    private _tmp_jointMatrixBlend = new Matrix4x4();

    static BlendMatrix(l:Matrix4x4, r:Matrix4x4, t:number, o:Matrix4x4)
    {
        for(var i = 0; i < 16; i ++)
        {
            o.elements[i] = l.elements[i] * (1 -t) + r.elements[i] * t;
        }
    }

    /** 刷新骨骼节点位置 */
    private UpdateJoints(frame: GPUSkinningFrame,nextFrame: GPUSkinningFrame,  nextFrameFade: float)
    {
        if(this.joints == null)
        {
            return;
        }

        let res = this.res;
        let joints = this.joints;
        let playingClip = this.playingClip;

        let matrices: Matrix4x4[]  = frame.matrices;
        let bones: GPUSkinningBone[]  = res.anim.bones;
        let numJoints:int  = joints.length;
        for(let i = 0; i < numJoints; ++i)
        {
            let joint: GPUSkinningPlayerJoint  = joints[i];
            let jointTransform: Transform3D  = joint.Transform;
            if (jointTransform != null)
            {
                // TODO: Update Joint when Animation Blend
                var jointMatrix: Matrix4x4 = this._tmp_jointMatrix;

                var frameM = frame.matrices[joint.index];
                var nextFrameM = nextFrame.matrices[joint.index];
                var blendFrameM = this._tmp_jointMatrixBlend;
                GPUSkinningPlayer.BlendMatrix(frameM, nextFrameM, nextFrameFade, blendFrameM);


                Matrix4x4.multiply(blendFrameM, bones[joint.index].BindposeInv, jointMatrix);
                if(playingClip.rootMotionEnabled && this.rootMotionEnabled)
                {
                    let outM: Matrix4x4 = new Matrix4x4();
                    Matrix4x4.multiply( frame.RootMotionInv(res.anim.rootBoneIndex), jointMatrix, outM);
                    jointMatrix = outM;
                }

                
                jointMatrix.decomposeTransRotScale(this._tmp_p, this._tmp_r, this._tmp_s);

                // jointTransform.localMatrix = jointMatrix;
                jointTransform.localPosition = this._tmp_p;
                jointTransform.localRotation = this._tmp_r;
            }
            else
            {
                joints.splice(i, 1);
                --i;
                --numJoints;
            }
        }
    }


    /** 设置根节点位置和旋转 */
    private DoRootMotion(frame: GPUSkinningFrame , blend: float , doRotate: boolean )
    {
        // TODO 占时没实现
        // if(frame == null)
        // {
        //     return;
        // }

        // Quaternion deltaRotation = frame.rootMotionDeltaPositionQ;
        // Vector3 newForward = deltaRotation * transform.forward;
        // Vector3 deltaPosition = newForward * frame.rootMotionDeltaPositionL * blend;
        // transform.Translate(deltaPosition, Space.World);

        // if (doRotate)
        // {
        //     transform.rotation *= frame.rootMotionDeltaRotation;
        // }
    }


    /** 刷新事件 */
    private UpdateEvents(playingClip: GPUSkinningClip , playingFrameIndex:int , corssFadeClip: GPUSkinningClip , crossFadeFrameIndex:int )
    {
        this.UpdateClipEvent(playingClip, playingFrameIndex);
        this.UpdateClipEvent(corssFadeClip, crossFadeFrameIndex);
    }


    /** 刷新剪辑事件 */
    private UpdateClipEvent(clip: GPUSkinningClip , frameIndex:int )
    {
        if(clip == null || clip.events == null || clip.events.length == 0)
        {
            return;
        }

        let events: GPUSkinningAnimEvent[]  = clip.events;
        let numEvents:int  = events.length;
        for(let i = 0; i < numEvents; ++i)
        {
            if(events[i].frameIndex == frameIndex)
            {
                this.sAnimEvent.dispatch(this, events[i].eventId);
                break;
            }
        }
    }

    public static RecoverWeaponItem(item: GPUSkinningPlayerMono | Laya.Sprite3D)
    {
        var mono:GPUSkinningPlayerMono = <GPUSkinningPlayerMono>item;
        if(item instanceof Laya.Sprite3D)
        {
            mono = item.getComponent(GPUSkinningPlayerMono);
            if(mono == null)
            {
                console.error("~~~weapon 不是GPUSkinningPlayerMono"+item.name);
                item.removeSelf();
                return;
            }
        }

        mono.owner.removeSelf();
        var key = mono.skinName + "&" + mono.animName;
        Laya.Pool.recover(key, mono);
    }

    public static GetWeaponItem(skinName: string, animName: string, callback:(mono: GPUSkinningPlayerMono)=>void)
    {
        var key = skinName + "&" + animName;
        var item = Laya.Pool.getItem(key);
        if(item)
        {
            callback && callback(item);
        }
        else
        {
            GPUSkining.CreateByName(skinName, animName, Laya.Handler.create(this, (item: GPUSkinningPlayerMono)=>{
                callback && callback(item);
            }));
        }
    }

    /** 当前武器字典 */
    weaponMap = new Map<string, GPUSkinningPlayerMono>();

    /** 设置武器 */
    public SetWeapon(boneName: string, skinName: string, animName:string)
    {
        var bone = this.FindJointGameObject(boneName);
        if(bone == null)
        {
            return;
        }

        GPUSkinningPlayer.GetWeaponItem(skinName, animName, (mono: GPUSkinningPlayerMono)=>{
            if(this.weaponMap.has(boneName))
            {
                var preWeapon = this.weaponMap.get(boneName);
                GPUSkinningPlayer.RecoverWeaponItem(preWeapon);
                this.weaponMap.delete(boneName);
            }

            bone.addChild(mono.owner);
            var sprite = <Laya.Sprite3D> mono.owner;
            sprite.transform.localPosition = new Vector3(0, 0, 0);
            sprite.transform.localRotationEuler = new Vector3(0, 0, 0);
            // sprite.transform.setWorldLossyScale(this.transform.getWorldLossyScale());
            this.weaponMap.set(boneName, mono);
            var clipName = this.PlayingClipName;
            
            if(!mono.Player.res.anim.clipMap.has(clipName))
            {
                clipName = "standby";
            }
            mono.Player.Play(clipName, this.NormalizedTime);

        })

    }

    /** 设置武器动作 */
    private SetWeapClip(clipName: string, nomrmalizeTime: number, timeDiff: number)
    {
        this.weaponMap.forEach((v, k)=>{
            if(!v.Player.res.anim.clipMap.has(clipName))
            {
                clipName = "standby";
            }
            v.Player.Play(clipName, nomrmalizeTime);
            v.Player.timeDiff = timeDiff;
        })
    }

    /** 设置武器播放速度 */
    private SetWeapSpeed(speed: number)
    {
        this.weaponMap.forEach((v, k)=>{
            v.Player.speed = speed;
        })
    }

    tweenSpeedStruct = new TweenSpeedStruct();
    /** 缓动速度,开始 */
    public TweenSpeedTest()
    {
        this.Play("behit_02", 0);
        this.TweenSpeed(0.1, 2, 2, this.playingClip.frameCount);
    }

    
    /**
     * 缓动速度,开始
     * @param speedHalt  v1, 停顿速度
     * @param frameHalt  t1, 停顿帧数
     * @param frameTween t2, 缓动帧数
     * @param frameTotal t3, 总帧数
     * @param speedEnd   v2, 缓动结束速度, 如果不传内部回自己计算
     */
    public TweenSpeed(speedHalt: number, frameHalt: number, frameTween: number, frameTotal: number, speedEnd?: number)
    {
        var t = this.tweenSpeedStruct;
        t.speedHalt = speedHalt;
        t.frameHalt = frameHalt;
        t.frameTween = frameTween;
        t.frameTotal = frameTotal;

        if(speedEnd === void 0)
        {
            t.calculationSpeedEnd();
        }
        else
        {
            t.speedEnd = speedEnd;
        }

        t.step = TweenSpeedStep.HALT;
        t.frameStepIndex = 0;
        t.frameIndex = 0;
        t.layaFrameBegin = Laya.timer.currFrame;
        t.clipFrameIndex = this.GetFrameIndex();
        t.time = 0;
        
    }

    /** 缓动速度,更新 */
    private TweenSpeedUpdate()
    {
        if(this.tweenSpeedStruct.step == TweenSpeedStep.END)
        {
            return;
        }
        var t = this.tweenSpeedStruct;
        t.time += Laya.timer.delta;
        var frameIndexFloat = t.time / 33;
        var frameIndex = Math.floor(frameIndexFloat);
        frameIndexFloat = frameIndexFloat - frameIndex;
        let subFrame = Math.max(frameIndex - t.clipFrameIndex, 0) ;
        
        t.clipFrameIndex = frameIndex;
        t.frameIndex += subFrame;
        t.frameStepIndex += subFrame;
        switch(t.step)
        {
            // 停顿阶段
            case TweenSpeedStep.HALT:
                this.speed = t.speedHalt;
                // console.log("停顿速度", this.speed, " frameStepIndex=", t.frameStepIndex, " frameIndex=", frameIndex);
                if(t.frameStepIndex >= t.frameHalt)
                {
                    t.step = TweenSpeedStep.TWEEN;
                    t.frameStepIndex = 0;
                }
                break;
            // 缓动帧
            case TweenSpeedStep.TWEEN:
                if(t.frameTween <= 0)
                {
                    this.speed = t.speedEnd;
                    t.step = TweenSpeedStep.SMOOTH;
                    break;
                }
                this.speed = Laya.MathUtil.lerp(t.speedHalt, t.speedEnd, (t.frameStepIndex + frameIndexFloat) / t.frameTween);
                // console.log("缓动速度", this.speed, " frameStepIndex=", t.frameStepIndex, " frameIndex=", frameIndex);
                if(t.frameStepIndex >= t.frameTween)
                {
                    // t.step = TweenSpeedStep.SMOOTH;
                    this.TweenSpeedStop();
                    t.frameStepIndex = 0;
                }
                break;
            // 平缓阶段
            case TweenSpeedStep.SMOOTH:
                // console.log("平缓阶段", this.speed, " frameStepIndex=", t.frameStepIndex, " frameIndex=", frameIndex, " t.frameIndex=", t.frameIndex);
                if(this.__frameIndex >= (t.frameTotal - 1))
                {
                    this.speed = 1;
                    this.TweenSpeedStop();
                    // console.log(Laya.timer.currFrame - t.layaFrameBegin, t.frameTotal);
                    // t.step = TweenSpeedStep.END;
                    this.Play("idle");
                } 
                break;
        }
    }



    TweenSpeedStop()
    {
        this.tweenSpeedStruct.step = TweenSpeedStep.END;
    }







}


/** 缓动帧参数 */
class TweenSpeedStruct
{
    /** 运行阶段 */
    step: TweenSpeedStep = TweenSpeedStep.END;
    /** 当前帧 */
    frameStepIndex: number = 0;
    /** 当前帧 */
    frameIndex: number = 0;
    /** 缓动结束速度 */
    speedEnd: number = 1;
    clipFrameIndex = 0;
    layaFrameBegin = 0;
    /** 逻辑帧时间 */
    time = 0;

    /** 停顿帧 速度 */
    speedHalt: number;
    /** 停顿帧 时长 */
    frameHalt: number; 
    /** 缓动帧 时长 */
    frameTween: number; 
    /** 平缓帧 剩余需要播放的时长  */
    frameTotal: number;

    calculationSpeedEnd()
    {
        this.speedEnd = TweenSpeedStruct.CalculationSpeed(this.speedHalt, this.frameHalt, this.frameTween, this.frameTotal);
    }

    /** 计算缓动结尾速度 */
    static CalculationSpeed(v1: number, t1: number, t2: number, t3: number)
    {
        // 梯形面积 = (上地 + 下底) * 高 / 2

        // 总面积 = frameTotal
        // 总面积 = 停顿矩形面积 + 缓动梯形面积 + 平缓矩形面积
        // 停顿矩形面积 = speedHalt * frameHalt
        // 平缓矩形面积 = x * frameTotal
        // 缓动梯形面积 = (speedHalt + x) * frameTween / 2

        // frameTotal =  (speedHalt * frameHalt)
        //            +  (x * frameTotal)
        //            +  (speedHalt + x) * frameTween / 2


        
        // frameTotal =  (speedHalt * frameHalt)
        //            +  (x * frameTotal)
        //            +  (speedHalt + x) * frameTween / 2

        
        // frameTotal =  (speedHalt * frameHalt)
        //            +  (x * frameTotal)
        //            +  (speedHalt  * frameTween / 2 + x  * frameTween / 2) 

        
        // frameTotal =  (speedHalt * frameHalt)
        //            +  speedHalt  * frameTween / 2 
        //            +  (x * frameTotal) + x  * frameTween / 2
        
        // frameTotal =  (speedHalt * frameHalt)
        //            +  speedHalt  * frameTween / 2 
        //            +  x * (frameTotal + frameTween / 2)

        
        // frameTotal -  (speedHalt * frameHalt) - (speedHalt  * frameTween / 2)  =  x * (frameTotal + frameTween / 2)
        // (frameTotal -  (speedHalt * frameHalt) - (speedHalt  * frameTween / 2))  /   (frameTotal + frameTween / 2) =  x
        // x = (t3 -   v1 * t1   -   v1 * t2 / 2)   /    (t3 + t2 / 2)

        return  (t3 -   v1 * t1   -   v1 * t2 / 2)   /    (t3 + t2 / 2);
    }


}

/** 缓动帧阶段类型 */
enum TweenSpeedStep
{
    /** 停顿阶段 */
    HALT = 0,
    /** 缓动阶段 */
    TWEEN = 1,
    /** 平缓阶段 */
    SMOOTH = 2,
    /** 结束 */
    END = 3,
}