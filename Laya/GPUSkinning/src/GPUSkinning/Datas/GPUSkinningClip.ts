import { GPUSkinningWrapMode } from "./GPUSkinningWrapMode";
import GPUSkinningAnimEvent from "./GPUSkinningAnimEvent";
import GPUSkinningFrame from "./GPUSkinningFrame";

import Byte = Laya.Byte;
import ByteReadUtil from "./ByteReadUtil";
/** 烘焙动画--动画剪辑数据信息 */
export default class GPUSkinningClip
{
    /** 名称 */
    name: string;

    /** 时间长度 （单位:秒） */
    length = 0.0;

    /** 播放帧率 （默认30） */
    fps = 0;

    /** 播放模式，单次或者循环 */
    wrapMode = GPUSkinningWrapMode.Once;

    /** 帧数据列表 */
    frames: GPUSkinningFrame[];

    /** 所在贴图像素起始位置 */
    pixelSegmentation:int = 0;

    /** 是否动画驱动位移 */
    rootMotionEnabled: boolean = false;

    /** 多个单位播放动作帧是否差异化 */
    individualDifferenceEnabled: boolean = false;

    /** 事件列表 */
    events: GPUSkinningAnimEvent[];

    /** 帧数 */
    frameCount = 0;
    /** 最后一帧 */
    frameLastIndex = 0;


    
    FromBytes(data: ArrayBuffer): void
    {
        var b:Byte = new Byte(data);
        b.pos = 0;
        this.name = b.readUTFString();
        // this.name = this.name.toLowerCase();
        this.length = b.readFloat32();
        this.fps = b.readUint32();
        this.wrapMode = b.readInt32();
        this.pixelSegmentation = b.readUint32();
        this.rootMotionEnabled = b.readByte() != 0;
        this.individualDifferenceEnabled = b.readByte() != 0;

        // 帧列表 数量
        var frameCount = b.readUint32();
        // 事件列表 数量
        var eventCount = b.readUint32();
        
        // 帧列表 头信息
        var framePosLengthList:int[][] = [];
        for(var i = 0; i < frameCount; i ++)
        {
            var info = [];
            info[0] = b.readUint32(); // posBegin
            info[1] = b.readUint32(); // length
            framePosLengthList.push(info);
        }

        
        // 事件列表 头信息
        var eventPosLengthList:int[][] = [];
        for(var i = 0; i < eventCount; i ++)
        {
            var info = [];
            info[0] = b.readUint32(); // posBegin
            info[1] = b.readUint32(); // length
            eventPosLengthList.push(info);
        }

        
        // 帧列表 数据块
        var frameList: GPUSkinningFrame[] = [];
        this.frames = frameList;
        for(var i = 0; i < frameCount; i ++)
        {
            var itemInfo:int[] = framePosLengthList[i];
            var pos = itemInfo[0];
            var len = itemInfo[1];

            b.pos = pos;
            var itemBuffer = b.readArrayBuffer(len);
            var item:any = GPUSkinningFrame.CreateFromBytes(itemBuffer, this.rootMotionEnabled);
            frameList.push(item);
        }


        
        // 事件列表 数据块
        var eventList: GPUSkinningAnimEvent[] = [];
        this.events = eventList;
        for(var i = 0; i < eventCount; i ++)
        {
            var itemInfo:int[] = eventPosLengthList[i];
            var pos = itemInfo[0];
            var len = itemInfo[1];

            b.pos = pos;
            var itemBuffer = b.readArrayBuffer(len);
            var item:any = GPUSkinningAnimEvent.CreateFromBytes(itemBuffer);
            eventList.push(item);
        }

        this.frameCount = Math.floor(this.length * this.fps);
        this.frameLastIndex = this.frameCount  - 1;


    }

    static CreateFromBytes(data: ArrayBuffer):GPUSkinningClip
    {
        var obj = new GPUSkinningClip();
        obj.FromBytes(data);
        return obj;
    }
}