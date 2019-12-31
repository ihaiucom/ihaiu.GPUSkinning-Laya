
/** 烘焙动画--动画剪辑事件 */
export default class GPUSkinningAnimEvent  
{
    /** 帧索引 */
    frameIndex:int = 0;

    /** 事件ID */
    eventId:int = 0;

    /** 比较 */
    CompareTo(other: GPUSkinningAnimEvent): int
    {
        return this.frameIndex > other.frameIndex ? -1 : 1;
    }

    
    FromBytes(data: ArrayBuffer): void
    {
        var b:Laya.Byte = new Laya.Byte(data);
        this.frameIndex = b.readInt32();
        this.eventId = b.readInt32();

    }

    static CreateFromBytes(data: ArrayBuffer):GPUSkinningAnimEvent
    {
        var obj = new GPUSkinningAnimEvent();
        obj.FromBytes(data);
        return obj;
    }
}