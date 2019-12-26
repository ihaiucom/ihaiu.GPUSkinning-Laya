/** 裁剪模式 */
export enum GPUSKinningCullingMode
{
    /** 总是播放 */
    AlwaysAnimate, 
    /**  */
    CullUpdateTransforms, 
    /** 裁剪剔除 不播放 */
    CullCompletely
}