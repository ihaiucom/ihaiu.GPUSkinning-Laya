import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import { GPUSKinningCullingMode } from "./GPUSKinningCullingMode";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkinningWrapMode } from "./Datas/GPUSkinningWrapMode";
import GPUSkinningMaterial from "./GPUSkinningMaterial";
import Vector3 = Laya.Vector3;
import Mesh = Laya.Mesh;
export default class GPUSkinningPlayer {
    private go;
    private transform;
    private mr;
    private mf;
    private spriteShaderData;
    private time;
    private timeDiff;
    private crossFadeTime;
    private crossFadeProgress;
    private lastPlayedTime;
    private lastPlayedClip;
    private lastPlayingFrameIndex;
    private lastPlayingClip;
    private playingClip;
    private res;
    private rootMotionFrameIndex;
    sAnimEvent: Typed2Signal<GPUSkinningPlayer, int>;
    private rootMotionEnabled;
    RootMotionEnabled: boolean;
    private cullingMode;
    CullingMode: GPUSKinningCullingMode;
    private visible;
    Visible: boolean;
    private lodEnabled;
    LODEnabled: boolean;
    private isPlaying;
    readonly IsPlaying: boolean;
    readonly PlayingClipName: string;
    readonly Position: Vector3;
    readonly LocalPosition: Vector3;
    private joints;
    readonly Joints: GPUSkinningPlayerJoint[];
    readonly WrapMode: GPUSkinningWrapMode;
    readonly ClipTimeLength: float;
    readonly IsTimeAtTheEndOfLoop: boolean;
    NormalizedTime: float;
    private GetCurrentTime;
    __frameIndex: int;
    private GetFrameIndex;
    private GetCrossFadeFrameIndex;
    private GetTheLastFrameIndex_WrapMode_Once;
    private GetFrameIndex_WrapMode_Loop;
    private GetCurrentMaterial;
    SetLODMesh(mesh: Mesh): void;
    mtrl: GPUSkinningMaterial;
    static _ShaderUID: number;
    constructor(go: Laya.MeshSprite3D, res: GPUSkinningPlayerResources);
    private ConstructJoints;
    private DeleteInvalidJoints;
    Play(clipName: string): void;
    CrossFade(clipName: string, fadeLength: float): void;
    private SetNewPlayingClip;
    Stop(): void;
    Resume(): void;
    isRandomPlayClip: boolean;
    randomPlayClipI: number;
    Update(timeDelta: float): void;
    onRenderUpdate(context: Laya.RenderContext3D, transform: Laya.Transform3D, render: Laya.MeshRenderer): void;
    private UpdateMaterial;
    private UpdateJoints;
    private DoRootMotion;
    private UpdateEvents;
    private UpdateClipEvent;
}
