import { GPUSkinningWrapMode } from "./GPUSkinningWrapMode";
import GPUSkinningAnimEvent from "./GPUSkinningAnimEvent";
import GPUSkinningFrame from "./GPUSkinningFrame";

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
    frames: GPUSkinningFrame;

    /** 所在贴图像素起始位置 */
    pixelSegmentation:int = 0;

    /** 是否动画驱动位移 */
    rootMotionEnabled: boolean = false;

    /** 多个单位播放动作帧是否差异化 */
    individualDifferenceEnabled: boolean = false;

    /** 事件列表 */
    events: GPUSkinningAnimEvent[];
}