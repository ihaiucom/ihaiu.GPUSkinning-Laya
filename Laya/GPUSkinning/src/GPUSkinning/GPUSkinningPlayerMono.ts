import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import { GPUSKinningCullingMode } from "./GPUSKinningCullingMode";
import GPUSkinningPlayerMonoManager from "./GPUSkinningPlayerMonoManager";
import GPUSkinningPlayer from "./GPUSkinningPlayer";
import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkining from "./GPUSkining";


/** GPU骨骼动画--组件 */
export default class GPUSkinningPlayerMono extends Laya.Script3D
{
    skinName: string;
    animName: string;

    isEnable: boolean = false;
    /** 烘焙动画--全部数据信息 */
    anim: GPUSkinningAnimation;

    /** 网格 */
    mesh: Mesh;
    
    /** 材质 */
    mtrl: Material;

    /** 烘焙动画--贴图数据 */
    textureRawData: Texture2D;

    /** 默认播放动画剪辑 */
    defaultPlayingClipIndex:int = 0;

    /** 根节点是否驱动位移 */
    rootMotionEnabled: boolean = false;

    /** LOD 模式是否开启 */
    lodEnabled: boolean = true;

    /** 裁剪模式 */
    cullingMode: GPUSKinningCullingMode = GPUSKinningCullingMode.CullUpdateTransforms;

    /** 播放管理器 */
    static playerManager: GPUSkinningPlayerMonoManager = new GPUSkinningPlayerMonoManager();

    /** 播放控制器 */
    private player: GPUSkinningPlayer;
    public get Player(): GPUSkinningPlayer
    {
        return this.player;
    }

    /** 查找导出的骨骼节点GameObject */
    public FindJointGameObject(boneName: string):Laya.Sprite3D
    {
        if(this.player)
        {
            return this.player.FindJointGameObject(boneName);
        }
        else
        {
            return null;
        }
    }

    gameObject: Laya.MeshSprite3D;

    _cloneTo(dest: GPUSkinningPlayerMono): void 
    {
        dest.skinName = this.skinName;
        dest.animName = this.animName;

        dest.anim = this.anim;
        dest.mesh = this.mesh;
        dest.mtrl = this.mtrl;
        dest.textureRawData = this.textureRawData;
        dest.Init();

        
        if(dest.player )
        {
            if(dest.player.__mname)
            {
                console.warn(dest.player.__mname);
            }
            else
            {
                dest.player.__mname = dest.anim.name + " _cloneTo Set";
            }
        }
    }
    /**
     * 创建后只执行一次
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onAwake():void
    {

        // console.log("onAwake");
    }

    /**
     * 每次启动后执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onEnable():void
    {
        // console.log("onEnable");
        var preHasPlayer = this.player != null;
        this.Init();

        
        if(!preHasPlayer  && this.player )
        {
            if(this.player.__mname)
            {
                console.warn(this.player.__mname);
            }
            else
            {
                this.player.__mname = this.anim.name + " onEnable Set";
            }
        }

        this.isEnable = true;
    }


    onStart():void
    {
        // console.log("onStart");
    }

    
    onUpdate():void
    {
        if(GPUSkining.IsPauseAll)
        {
            return;
        }
        
        if(this.player != null)
        {
            this.player.Update(Laya.timer.delta / 1000 );
        }
    }


	/**
	 * 禁用时执行
	 * 此方法为虚方法，使用时重写覆盖即可
	 */
	onDisable(): void {

        // console.log("onDisable");
        this.isEnable = false;
        
        if(this.player)
        {
            this.player.ClearMaterialState();
            this.player.speed = 1;
        }
	}

    
    onDestroy():void
    {

        // console.log("onDestroy");
        GPUSkinningPlayerMono.playerManager.Unregister(this);
        this.anim = null;
        this.mesh = null;
        this.mtrl = null;
        this.textureRawData = null;

        if(this.player)
        {
            this.player.onDestroy();
            this.player = null;
        }
        
    }

    public SetData(anim: GPUSkinningAnimation, mesh: Mesh, mtrl: Material, textureRawData: Texture2D)
    {
        if(this.player != null)
        {
            return;
        }

        this.anim = anim;
        this.mesh = mesh;
        this.mtrl = mtrl;
        this.textureRawData = textureRawData;
        this.Init();

        if(this.player )
        {
            if(this.player.__mname)
            {
                console.warn(this.player.__mname);
            }
            else
            {
                this.player.__mname = anim.name + " SetData Set";
            }
        }
    }

    Init()
    {
        this.gameObject = <Laya.MeshSprite3D> this.owner;


        if(this.player != null)
        {
            return;
        }

        
        let anim = this.anim;
        let mesh = this.mesh;
        let mtrl = this.mtrl;
        let textureRawData = this.textureRawData;


        if(anim != null && mesh != null && mtrl != null && textureRawData != null)
        {
            let res: GPUSkinningPlayerResources = GPUSkinningPlayerMono.playerManager.Register(anim, mesh, mtrl, textureRawData, this);

            let player = new GPUSkinningPlayer(this.gameObject, res);
            player.RootMotionEnabled = this.rootMotionEnabled;
            player.CullingMode = this.cullingMode;
            this.player = player;


            if (anim != null && anim.clips != null && anim.clips.length > 0)
            {
                var defaultClipName = anim.clips[Mathf.clamp(this.defaultPlayingClipIndex, 0, anim.clips.length)].name;

                
                for(var clip of anim.clips)
                {
                    if(clip.name == "standby")
                    {
                        defaultClipName = clip.name;
                        break;
                    }
                    else if(clip.name == "idle")
                    {
                        defaultClipName = clip.name;
                        break;
                    }
                }

                player.Play(defaultClipName);
            }
        }
    }



}