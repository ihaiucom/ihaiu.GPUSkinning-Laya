import { GPUSkinningWrapMode } from "./GPUSkinningWrapMode";
import GPUSkinningAnimEvent from "./GPUSkinningAnimEvent";
import GPUSkinningFrame from "./GPUSkinningFrame";
export default class GPUSkinningClip {
    name: string;
    length: number;
    fps: number;
    wrapMode: GPUSkinningWrapMode;
    frames: GPUSkinningFrame[];
    pixelSegmentation: int;
    rootMotionEnabled: boolean;
    individualDifferenceEnabled: boolean;
    events: GPUSkinningAnimEvent[];
    FromBytes(data: ArrayBuffer): void;
    static CreateFromBytes(data: ArrayBuffer): GPUSkinningClip;
}
