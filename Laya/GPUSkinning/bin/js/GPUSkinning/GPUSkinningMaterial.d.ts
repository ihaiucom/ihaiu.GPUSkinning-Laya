import GPUSkinningExecuteOncePerFrame from "./GPUSkinningExecuteOncePerFrame";
export default class GPUSkinningMaterial {
    material: Laya.Material;
    executeOncePerFrame: GPUSkinningExecuteOncePerFrame;
    Destroy(): void;
}
