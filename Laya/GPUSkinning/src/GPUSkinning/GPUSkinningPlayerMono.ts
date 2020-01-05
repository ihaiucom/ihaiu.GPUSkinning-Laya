import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import { GPUSKinningCullingMode } from "./GPUSKinningCullingMode";
import GPUSkinningPlayerMonoManager from "./GPUSkinningPlayerMonoManager";
import GPUSkinningPlayer from "./GPUSkinningPlayer";
import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";


/** GPU骨骼动画--组件 */
export default class GPUSkinningPlayerMono extends Laya.Script3D
{
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

    gameObject: Laya.MeshSprite3D;
    

    onStart():void
    {
        this.Init();
    }

    
    onUpdate():void
    {
        if(this.player != null)
        {
            this.player.Update(Laya.timer.delta / 1000 );
        }
    }

    
    onDestroy():void
    {

        this.anim = null;
        this.mesh = null;
        this.mtrl = null;
        this.textureRawData = null;

        GPUSkinningPlayerMono.playerManager.Unregister(this);
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
            player.LODEnabled = this.lodEnabled;
            player.CullingMode = this.cullingMode;
            this.player = player;

            if (anim != null && anim.clips != null && anim.clips.length > 0)
            {
                player.Play(anim.clips[Mathf.clamp(this.defaultPlayingClipIndex, 0, anim.clips.length)].name);
            }


        }
    }

}