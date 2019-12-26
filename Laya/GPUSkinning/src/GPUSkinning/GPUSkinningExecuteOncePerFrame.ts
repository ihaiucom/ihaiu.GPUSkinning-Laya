/** 一帧只执行一次标记 */
export default class GPUSkinningExecuteOncePerFrame
{
    private frameCount: int = -1;

    /** 获取当前帧是否能执行 */
    public CanBeExecute()
    {
        return this.frameCount != Laya.timer.currFrame;
    }

    /** 标记当前帧已经执行过了 */
    public MarkAsExecuted()
    {
        this.frameCount = Laya.timer.currFrame;
    }
}