
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import GPUSkinningBetterList from "./GPUSkinningBetterList";
import GPUSkinningMaterial from "./GPUSkinningMaterial";
import GPUSkinningExecuteOncePerFrame from "./GPUSkinningExecuteOncePerFrame";
import GPUSkinningPlayer from "./GPUSkinningPlayer";

import Material = Laya.Material;
import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import BoundSphere = Laya.BoundSphere;
import Vector4 = Laya.Vector4;
import Vector3 = Laya.Vector3;
import Matrix4x4 = Laya.Matrix4x4;
import ShaderDefine = Laya.ShaderDefine;
import Shader3D = Laya.Shader3D;

import GPUSkinningClip from "./Datas/GPUSkinningClip";
import GPUSkinningFrame from "./Datas/GPUSkinningFrame";
import { MaterialState } from "./MaterialState";
import { GPUSkinningQuality } from "./Datas/GPUSkinningQuality";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";


/** GPU骨骼动画--资源 */
export default class GPUSkinningPlayerResources
{

    /** 烘焙动画--全部数据信息 */
    public anim: GPUSkinningAnimation  = null;

    /** 网格 */
    public mesh: Mesh  = null;

    /** 烘焙动画--贴图数据 */
    public texture: Texture2D;

    /** 动画播放控制器列表 */
    public players: GPUSkinningPlayerMono[] = [];

    /** 裁剪组 */
    private cullingGroup:any = null;

    /** 裁剪列表 <球形包围盒> */
    private cullingBounds: GPUSkinningBetterList<BoundSphere> = new GPUSkinningBetterList<BoundSphere>(100);

    /** 材质球列表 */
    private mtrls: GPUSkinningMaterial[]  = null;

    /** 一帧只执行一次标记 */
    private executeOncePerFrame:GPUSkinningExecuteOncePerFrame  = new GPUSkinningExecuteOncePerFrame();




    private time: float = 0;
    public get Time():float
    {
        return this.time;
    }

    public set Time(value: float)
    {
        this.time = value;
    }

    private static keywords: string[]  = [
        "ROOTON_BLENDOFF", "ROOTON_BLENDON_CROSSFADEROOTON", "ROOTON_BLENDON_CROSSFADEROOTOFF",
        "ROOTOFF_BLENDOFF", "ROOTOFF_BLENDON_CROSSFADEROOTON", "ROOTOFF_BLENDON_CROSSFADEROOTOFF" 
    ];

    
    private static keywordDefines: Laya.ShaderDefine[]  = [];
    private static ShaderDefine_SKIN_1: Laya.ShaderDefine;
    private static ShaderDefine_SKIN_2: Laya.ShaderDefine;
    private static ShaderDefine_SKIN_4: Laya.ShaderDefine;
    

    private static  shaderPropID_GPUSkinning_TextureMatrix : int= -1;

    private static  shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame : int= 0;

    public static  shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation : int= 0;

    public static  shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Last : int= 0;

    private static  shaderPropID_GPUSkinning_RootMotion : int= 0;

    public static  shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade : int= 0;

    private static  shaderPropID_GPUSkinning_RootMotion_CrossFade : int= 0;

    private static _isInited: boolean = false;
    static Init()
    {
        if(this._isInited)
            return;

        this._isInited = true;

        for(let key of this.keywords)
        {
            this.keywordDefines.push(Shader3D.getDefineByName(key));
        }

        this.ShaderDefine_SKIN_1 = Shader3D.getDefineByName("SKIN_1");
        this.ShaderDefine_SKIN_2 = Shader3D.getDefineByName("SKIN_2");
        this.ShaderDefine_SKIN_4 = Shader3D.getDefineByName("SKIN_4");

        this.shaderPropID_GPUSkinning_TextureMatrix = Shader3D.propertyNameToID("u_GPUSkinning_TextureMatrix");

        this.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame = Shader3D.propertyNameToID("u_GPUSkinning_TextureSize_NumPixelsPerFrame");
        this.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation = Shader3D.propertyNameToID("u_GPUSkinning_FrameIndex_PixelSegmentation");
        this.shaderPropID_GPUSkinning_RootMotion = Shader3D.propertyNameToID("u_GPUSkinning_RootMotion");
        this.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade = Shader3D.propertyNameToID("u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade");
        this.shaderPropID_GPUSkinning_RootMotion_CrossFade = Shader3D.propertyNameToID("u_GPUSkinning_RootMotion_CrossFade");


    }

    constructor()
    {
        GPUSkinningPlayerResources.Init();
    }

    /** 销毁 */
    public Destroy()
    {
        
        if(this.anim != null)
        {
            this.anim.destroy();
            this.anim = null;
        }

        if(this.mesh != null)
        {
            this.mesh.destroy();
            this.mesh = null;
        }


        if(this.mtrls != null)
        {
            for(let i = 0; i < this.mtrls.length; i ++)
            {
                this.mtrls[i].Destroy();
                this.mtrls[i] = null;
            }
            this.mtrls = null;
        }

        if(this.texture != null)
        {
            this.texture.destroy();
            this.texture = null;
        }

        if(this.players != null)
        {
            this.players.length = 0;
            this.players = null;
        }

    }

    /** 添加包围盒 */
    public AddCullingBounds()
    {
        this.cullingBounds.Add(new BoundSphere(new Vector3(0, 0, 0), 0));
    }

    /** 移除包围盒 */
    public RemoveCullingBounds(index: int )
    {
        this.cullingBounds.RemoveAt(index);

    }

    /** 动画播放控制器LOD改变 */
    public LODSettingChanged(player: GPUSkinningPlayer )
    {
        if(player.LODEnabled)
        {
            let players = this.players;
            let numPlayers = players.length;
            for(let i = 0; i < numPlayers; i ++)
            {
                if(players[i].Player == player)
                {
                    let distanceIndex = 0;
                    this.SetLODMeshByDistanceIndex(distanceIndex, players[i].Player);
                    break;
                }

            }
        }
        else
        {
            player.SetLODMesh(null);
        }
    }


    /** 根据距离设置LOD */
    private SetLODMeshByDistanceIndex(index: int , player: GPUSkinningPlayer )
    {
        let lodMesh: Mesh  = null;
        if (index == 0)
        {
            lodMesh = this.mesh;
        }
        else
        {
            let lodMeshes: Mesh[]  = this.anim.lodMeshes;
            lodMesh = lodMeshes == null || lodMeshes.length == 0 ? this.mesh : lodMeshes[Math.min(index - 1, lodMeshes.length - 1)];
            if (lodMesh == null) lodMesh = this.mesh;
        }
        player.SetLODMesh(lodMesh);
    }


    /** 更新裁剪 包围盒 */
    private UpdateCullingBounds()
    {
        let numPlayers = this.players.length;
        for (let i = 0; i < numPlayers; ++i)
        {
            let player: GPUSkinningPlayerMono  = this.players[i];
            if(!player.isEnable)
            {
                // console.log(player.anim.name, player.isEnable);
                continue;
            }
            
            if(!player.Player || !player.Player.Position)
            {
                console.error("player.Player =null");
                return;
            }
            let bounds: BoundSphere  = this.cullingBounds.Get(i);
            bounds.center = player.Player.Position;
            bounds.radius = this.anim.sphereRadius;
            this.cullingBounds[i] = bounds;
        }
    }

    /** 帧更新 */
    public Update(deltaTime: float , mtrl: GPUSkinningMaterial )
    {
        if (this.executeOncePerFrame.CanBeExecute())
        {
            this.executeOncePerFrame.MarkAsExecuted();
            this.time += deltaTime;
            // this.UpdateCullingBounds();
        }

        if (mtrl.executeOncePerFrame.CanBeExecute())
        {
            let anim = this.anim;
            mtrl.executeOncePerFrame.MarkAsExecuted();
            mtrl.material._shaderValues.setTexture(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureMatrix, this.texture);
            // console.log("textureWidth=", anim.textureWidth, "textureHeight=", anim.textureWidth, "anim.bonesCount * 3=",anim.bonesCount* 3);
        
            mtrl.material._shaderValues.setVector(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame, 
                new Vector4(anim.textureWidth, anim.textureHeight, anim.bonesCount * 3 /*treat 3 pixels as a float3x4*/, 0));
        }
    }



    /** 更新数据 */
    public UpdatePlayingData( mpb: Laya.ShaderData , spriteShaderData: Laya.ShaderData, 
        playingClip: GPUSkinningClip , frameIndex: int ,  
        nextFrameIndex: int ,  nextFrameFade,
        frame: GPUSkinningFrame , rootMotionEnabled: boolean ,
        lastPlayedClip: GPUSkinningClip , frameIndex_crossFade: int , crossFadeTime: float , crossFadeProgress: float )
    {
        // console.log("frameIndex=", frameIndex, "nextFrameIndex=", nextFrameIndex, "nextFrameFade", nextFrameFade );
        // console.log(spriteShaderData["__id"], playingClip.name,"frameIndex=", frameIndex, "pixelSegmentation", playingClip.pixelSegmentation);
        spriteShaderData.setVector( GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation, new Vector4(frameIndex, playingClip.pixelSegmentation, nextFrameIndex, nextFrameFade));

        if (rootMotionEnabled)
        {
            let rootMotionInv: Matrix4x4  = frame.RootMotionInv(this.anim.rootBoneIndex);
            mpb.setMatrix4x4(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion, rootMotionInv);
        }

        if (this.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress))
        {
            if (lastPlayedClip.rootMotionEnabled)
            {
                mpb.setMatrix4x4(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion_CrossFade, 
                    lastPlayedClip.frames[frameIndex_crossFade].RootMotionInv(this.anim.rootBoneIndex));
            }
            console.log(spriteShaderData["__id"], "frameIndex_crossFade",frameIndex_crossFade, "CrossFadeBlendFactor", this.CrossFadeBlendFactor(crossFadeProgress, crossFadeTime) ,  playingClip.name,"frameIndex=", frameIndex, "pixelSegmentation", playingClip.pixelSegmentation);
      
            spriteShaderData.setVector(GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade,
                new Vector4(frameIndex_crossFade, lastPlayedClip.pixelSegmentation, this.CrossFadeBlendFactor(crossFadeProgress, crossFadeTime)));
        }
    }


    /** 动画混合百分比 */
    public CrossFadeBlendFactor(crossFadeProgress: float , crossFadeTime: float ):float
    {
        return Mathf.Clamp01(crossFadeProgress / crossFadeTime);
    }

    /** 是否是动画混合阶段 */
    public IsCrossFadeBlending(lastPlayedClip: GPUSkinningClip , crossFadeTime: float , crossFadeProgress: float ): boolean
    {
        return lastPlayedClip != null && crossFadeTime > 0 && crossFadeProgress <= crossFadeTime;
    }


    /** 获取材质，根据状态 */
    public GetMaterial(state: MaterialState ):GPUSkinningMaterial
    {
        return this.mtrls[state];
    }

    public InitMaterial(originalMaterial: GPUSkinningBaseMaterial, skinningQuality: GPUSkinningQuality)
    {
        if(this.mtrls != null)
        {
            return;
        }
        // console.log("CloneMaterial skinningQuality=", skinningQuality);

        let SKILL_N:ShaderDefine;
        switch(skinningQuality)
        {
            case GPUSkinningQuality.Bone1:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_1;
                break;
            case GPUSkinningQuality.Bone2:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_2;
                break;
            case GPUSkinningQuality.Bone4:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_4;
                break;
        }

        let mtrls = this.mtrls = [];

        for (let i = 0; i < MaterialState.Count; ++i)
        {
            let materialItem = new GPUSkinningMaterial();
            let material =  materialItem.material = <GPUSkinningBaseMaterial> originalMaterial.clone();
            material.lock = true;
            material.__mname = originalMaterial.__mname + " "+ GPUSkinningPlayerResources.keywords[i];

            mtrls[i] = materialItem;
            
            material.name = GPUSkinningPlayerResources.keywords[i];
           
            material._shaderValues.addDefine(SKILL_N);


            // TODO 还未实现
            // material.enableInstancing = true; // enable instancing in Unity 5.6
            this.EnableKeywords(i, materialItem);

        }
    }

    CloneMaterial(originalMaterial:GPUSkinningBaseMaterial, skinningQuality: GPUSkinningQuality)
    {
        if(originalMaterial == null)
        {
            console.error("GPUSkinningPlayerResources.CloneMaterial originalMaterial=null");
        }
        // console.log("CloneMaterial skinningQuality=", skinningQuality);
        let material =  <GPUSkinningBaseMaterial> originalMaterial.clone();
        material.__mname = originalMaterial.__mname + " CloneMaterial";
        
        let SKILL_N:ShaderDefine;
        switch(skinningQuality)
        {
            case GPUSkinningQuality.Bone1:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_1;
                break;
            case GPUSkinningQuality.Bone2:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_2;
                break;
            case GPUSkinningQuality.Bone4:
                SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_4;
                break;
        }

        
        material._shaderValues.addDefine(SKILL_N);
        material._shaderValues.addDefine(GPUSkinningPlayerResources.keywordDefines[3]);
        return material;
    }

    private EnableKeywords(ki: int , mtrl: GPUSkinningMaterial )
    {
        for(let i = 0; i < this.mtrls.length; ++i)
        {
            if(i == ki)
            {
                mtrl.material._shaderValues.addDefine(GPUSkinningPlayerResources.keywordDefines[i]);
            }
            else
            {
                mtrl.material._shaderValues.removeDefine(GPUSkinningPlayerResources.keywordDefines[i]);
            }
        }
    }






}