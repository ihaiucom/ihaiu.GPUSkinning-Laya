
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import GPUSkinningExecuteOncePerFrame from "./GPUSkinningExecuteOncePerFrame";

import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import Vector4 = Laya.Vector4;
import Matrix4x4 = Laya.Matrix4x4;
import ShaderDefine = Laya.ShaderDefine;
import Shader3D = Laya.Shader3D;

import GPUSkinningClip from "./Datas/GPUSkinningClip";
import GPUSkinningFrame from "./Datas/GPUSkinningFrame";
import { MaterialState } from "./MaterialState";
import { GPUSkinningQuality } from "./Datas/GPUSkinningQuality";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";

interface IResReferenceCount
{
    __resReferenceCount: number;
    _url:string;
    destroy();
}


/** GPU骨骼动画--资源 */
export default class GPUSkinningPlayerResources
{
    public key:string;

    /** 烘焙动画--全部数据信息 */
    public anim: GPUSkinningAnimation  = null;

    /** 网格 */
    public mesh: Mesh  = null;

    /** 烘焙动画--贴图数据 */
    public texture: Texture2D;

    /** 动画播放控制器列表 */
    public players: GPUSkinningPlayerMono[] = [];


    /** 材质球列表 */
    private material: GPUSkinningBaseMaterial  = null;

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

    public SetRes(anim: GPUSkinningAnimation , mesh: Mesh , originalMtrl:GPUSkinningBaseMaterial, texture: Texture2D, skinQuality: int)
    {
        this.anim = anim;
        this.mesh = mesh;
        this.texture = texture;
        
        this.SetMaterialQuality(originalMtrl, skinQuality, anim, texture);
        this.material = originalMtrl;

        var r = <IResReferenceCount><any> anim;
        r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount + 1 : 1;
        // console.log("SetRes", r._url,  r.__resReferenceCount);
        
        var r = <IResReferenceCount><any> mesh;
        r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount + 1 : 1;
        // console.log("SetRes", r._url,  r.__resReferenceCount);
        
        var r = <IResReferenceCount><any> originalMtrl;
        r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount + 1 : 1;
        // console.log("SetRes", r._url,  r.__resReferenceCount);
        
        var r = <IResReferenceCount><any> texture;
        r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount + 1 : 1;
        // console.log("SetRes", r._url,  r.__resReferenceCount);
    }

    /** 销毁 */
    public Destroy()
    {   
        var r = <IResReferenceCount><any> this.anim;
        if(r)
        {
            r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount - 1 : 0;
            
            // console.log("D", r._url,  r.__resReferenceCount);
            if(r.__resReferenceCount <= 0)
            {
                r.destroy();
                this.anim = null;
            }
        } 

        
        var r = <IResReferenceCount><any> this.mesh;
        if(r)
        {
            r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount - 1 : 0;
            // console.log("D", r._url,  r.__resReferenceCount);
            if(r.__resReferenceCount <= 0)
            {
                r.destroy();
                this.mesh = null;
            }
        } 

        
        var r = <IResReferenceCount><any> this.material;
        if(r)
        {
            r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount - 1 : 0;
            // console.log("D", r._url,  r.__resReferenceCount);
            if(r.__resReferenceCount <= 0)
            {
                r.destroy();
                this.material = null;
            }
        } 

        
        var r = <IResReferenceCount><any> this.texture;
        if(r)
        {
            r.__resReferenceCount = r.__resReferenceCount ? r.__resReferenceCount - 1 : 0;
            // console.log("D", r._url,  r.__resReferenceCount);
            if(r.__resReferenceCount <= 0)
            {
                r.destroy();
                this.texture = null;
            }
        } 


        if(this.players != null)
        {
            this.players.length = 0;
            this.players = null;
        }

    }



    /** 帧更新 */
    public Update(deltaTime: float , material: GPUSkinningBaseMaterial )
    {
        // if (this.executeOncePerFrame.CanBeExecute())
        // {
        //     this.executeOncePerFrame.MarkAsExecuted();
        //     this.time += deltaTime;

            
        //     let anim = this.anim;
        //     material._shaderValues.setTexture(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureMatrix, this.texture);
        //     // console.log("textureWidth=", anim.textureWidth, "textureHeight=", anim.textureWidth, "anim.bonesCount * 3=",anim.bonesCount* 3);
        //     material._shaderValues.setVector(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame, 
        //         new Vector4(anim.textureWidth, anim.textureHeight, anim.bonesCount * 3 /*treat 3 pixels as a float3x4*/, 0));
        // }

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
    public GetMaterial(state: MaterialState ):GPUSkinningBaseMaterial
    {
        return this.material;
        // return this.material[state];
    }

    // public InitMaterial(originalMaterial: GPUSkinningBaseMaterial, skinningQuality: GPUSkinningQuality)
    // {
    //     if(this.material != null)
    //     {
    //         return;
    //     }
    //     // console.log("CloneMaterial skinningQuality=", skinningQuality);

    //     let SKILL_N:ShaderDefine;
    //     switch(skinningQuality)
    //     {
    //         case GPUSkinningQuality.Bone1:
    //             SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_1;
    //             break;
    //         case GPUSkinningQuality.Bone2:
    //             SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_2;
    //             break;
    //         case GPUSkinningQuality.Bone4:
    //             SKILL_N =  GPUSkinningPlayerResources.ShaderDefine_SKIN_4;
    //             break;
    //     }


    //     let mtrls = this.material = [];

    //     for (let i = 0; i < MaterialState.Count; ++i)
    //     {
    //         let material =  <GPUSkinningBaseMaterial> originalMaterial.clone();
    //         material.lock = true;
    //         material.__mname = originalMaterial.__mname + " "+ GPUSkinningPlayerResources.keywords[i];

    //         mtrls[i] = material;
            
    //         material.name = GPUSkinningPlayerResources.keywords[i];
           
    //         material._shaderValues.addDefine(SKILL_N);


    //         // TODO 还未实现
    //         // material.enableInstancing = true; // enable instancing in Unity 5.6
    //         this.EnableKeywords(i, material);
    //     }
    // }

    CloneMaterial(originalMaterial:GPUSkinningBaseMaterial, skinningQuality: GPUSkinningQuality)
    {
        if(originalMaterial == null)
        {
            console.error("GPUSkinningPlayerResources.CloneMaterial originalMaterial=null");
        }
        // console.log("CloneMaterial skinningQuality=", skinningQuality);
        let material =  <GPUSkinningBaseMaterial> originalMaterial.clone();
        material.__mname = originalMaterial.__mname + " CloneMaterial";
        
        this.SetMaterialQuality(material, skinningQuality, this.anim, this.texture);
        return material;
    }

    private SetMaterialQuality(material:GPUSkinningBaseMaterial, skinningQuality: GPUSkinningQuality, anim: GPUSkinningAnimation , textureMatrix: Texture2D)
    {
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
        
        
        material._shaderValues.setTexture(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureMatrix, this.texture);
        // console.log("textureWidth=", anim.textureWidth, "textureHeight=", anim.textureWidth, "anim.bonesCount * 3=",anim.bonesCount* 3);
        material._shaderValues.setVector(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame, 
            new Vector4(anim.textureWidth, anim.textureHeight, anim.bonesCount * 3 /*treat 3 pixels as a float3x4*/, 0));
    }

    // private EnableKeywords(ki: int , material: GPUSkinningBaseMaterial )
    // {
    //     for(let i = 0; i < this.material.length; ++i)
    //     {
    //         if(i == ki)
    //         {
    //             material._shaderValues.addDefine(GPUSkinningPlayerResources.keywordDefines[i]);
    //         }
    //         else
    //         {
    //             material._shaderValues.removeDefine(GPUSkinningPlayerResources.keywordDefines[i]);
    //         }
    //     }
    // }






}