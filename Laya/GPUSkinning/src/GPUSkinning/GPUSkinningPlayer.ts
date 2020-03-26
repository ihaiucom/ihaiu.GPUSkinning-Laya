import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningClip from "./Datas/GPUSkinningClip";
import { GPUSKinningCullingMode } from "./GPUSKinningCullingMode";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkinningWrapMode } from "./Datas/GPUSkinningWrapMode";
import GPUSkinningMaterial from "./GPUSkinningMaterial";
import LayaUtil from "../LayaExtends/LayaUtil";
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
import { GPUSkinningUnlitMaterial } from "./Material/GPUSkinningUnlitMaterial";

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

    public speed: float = 1;
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

    mtrl: GPUSkinningMaterial;

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
            return null;
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
        // clipName = clipName.toUpperCase();
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
        if(this.speed == 0)
        {
            this.nextFrameIndex = this.__frameIndex;
        }
        else
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
            this.UpdateJoints(frame);
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


    /** 刷新骨骼节点位置 */
    private UpdateJoints(frame: GPUSkinningFrame )
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
                var jointMatrix: Matrix4x4 = new Matrix4x4();

                Matrix4x4.multiply(frame.matrices[joint.index], bones[joint.index].BindposeInv, jointMatrix);
                if(playingClip.rootMotionEnabled && this.rootMotionEnabled)
                {
                    let outM: Matrix4x4 = new Matrix4x4();
                    Matrix4x4.multiply( frame.RootMotionInv(res.anim.rootBoneIndex), jointMatrix, outM);
                    jointMatrix = outM;
                }

                jointTransform.localMatrix = jointMatrix;


                // var vec3 = new Vector3();
                // jointMatrix.getTranslationVector(vec3);
                // jointTransform.localPosition = vec3;

                // vec3 = new Vector3();

                // jointMatrix.getForward(vec3);

                // var vec3_2 = new Vector3();
                // Quaternion.angleTo(new Vector3(0, 0, 0), vec3, vec3_2);

                // jointTransform.localRotationEuler = vec3_2;
                // console.log("localPosition=", jointTransform.localPosition, " localRotationEuler=", jointTransform.localRotationEuler);
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







}