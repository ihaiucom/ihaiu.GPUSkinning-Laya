
#ifdef SKIN_2


vec4 skin_noroot(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3)
{
     return s.m0 * vertex * uv2.y 
         + s.m1 * vertex * uv2.w;
}

vec4 skin_root(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3, mat4 root)
{
     return (root * (s.m0 * vertex)) * uv2.y 
         + (root * (s.m1 * vertex)) * uv2.w ;
}


#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin_noroot(s, vertex, uv2, uv3);
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 rootOn_BlendOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin_root(s, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_root(s0, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin_root(s1, vertex, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_root(s0, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin_noroot(s1, vertex, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
vec4 rootOff_BlendOn_CrossFadeRootOn(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_noroot(s0, vertex, uv2, uv3);
    vec4 pos1 = skin_root(s1, vertex, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
vec4 rootOff_BlendOn_CrossFadeRootOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_noroot(s0, vertex, uv2, uv3);
    vec4 pos1 = skin_noroot(s1, vertex, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif

vec4 skin(vec4 vertex, vec4 uv2, vec4 uv3)
{
    #ifdef ROOTOFF_BLENDOFF
        return rootOff_BlendOff(vertex, uv2, uv3);
    #endif

    #ifdef ROOTON_BLENDOFF
        rootOn_BlendOff(vertex, uv2, uv3);
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTON
        rootOn_BlendOn_CrossFadeRootOn(vertex, uv2, uv3);
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
        rootOn_BlendOn_CrossFadeRootOff(vertex, uv2, uv3);
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
        rootOff_BlendOn_CrossFadeRootOn(vertex, uv2, uv3);
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
        rootOff_BlendOn_CrossFadeRootOff(vertex, uv2, uv3);
    #endif

    return vec4(0.0, 0.0, 0.0, 0.0);
}
#endif