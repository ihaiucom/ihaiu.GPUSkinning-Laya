/** 材质状态 */
export enum MaterialState
{
    RootOn_BlendOff = 0, 
    RootOn_BlendOn_CrossFadeRootOn,
    RootOn_BlendOn_CrossFadeRootOff,
    RootOff_BlendOff,
    RootOff_BlendOn_CrossFadeRootOn,
    RootOff_BlendOn_CrossFadeRootOff, 
    Count = 6
}