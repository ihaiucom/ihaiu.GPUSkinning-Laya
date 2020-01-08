import GPUSkinningBone from "./GPUSkinningBone";
import GPUSkinningClip from "./GPUSkinningClip";
import { GPUSkinningQuality } from "./GPUSkinningQuality";
export default class GPUSkinningAnimation {
    version: string;
    guid: string;
    name: string;
    bonesCount: number;
    bones: GPUSkinningBone[];
    rootBoneIndex: int;
    clips: GPUSkinningClip[];
    bounds: Laya.Bounds;
    textureWidth: number;
    textureHeight: number;
    lodDistances: float[];
    lodMeshes: Laya.Mesh[];
    sphereRadius: float;
    skinQuality: GPUSkinningQuality;
    FromBytes(arrayBuffer: ArrayBuffer): void;
    static CreateFromBytes(data: ArrayBuffer): GPUSkinningAnimation;
    static LoadAsync(path: string): Promise<GPUSkinningAnimation>;
    static Load(path: string, callback: ((anim: GPUSkinningAnimation) => any)): void;
}
