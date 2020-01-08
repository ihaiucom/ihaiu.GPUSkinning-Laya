export default class GPUSkinningAnimEvent {
    frameIndex: int;
    eventId: int;
    CompareTo(other: GPUSkinningAnimEvent): int;
    FromBytes(data: ArrayBuffer): void;
    static CreateFromBytes(data: ArrayBuffer): GPUSkinningAnimEvent;
}
