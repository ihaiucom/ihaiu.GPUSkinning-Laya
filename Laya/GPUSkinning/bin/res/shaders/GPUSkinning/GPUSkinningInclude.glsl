#ifndef GPUSKINNING_INCLUDE
#define GPUSKINNING_INCLUDE


uniform sampler2D _GPUSkinning_TextureMatrix;
// x=textureWidth, y=textureHeight, z=bones.Length * 3
uniform vec3 _GPUSkinning_TextureSize_NumPixelsPerFrame;
// x=frameIndex, y=playingClip.pixelSegmentation
uniform vec2 _GPUSkinning_FrameIndex_PixelSegmentation;
// x=frameIndex_crossFade, y=lastPlayedClip.pixelSegmentation, z=crossFadeRate
uniform vec3 _GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;

// 当前帧 根骨骼 逆矩阵
uniform mat4 _GPUSkinning_RootMotion;

// 混合帧 根骨骼 逆矩阵
uniform mat4 _GPUSkinning_RootMotion_CrossFade;


struct GPUSkingingTextureMatrixs
{
	float frameStartIndex;
	mat4 m0;
	mat4 m1;
	mat4 m2;
	mat4 m3;
};

vec4 indexToUV(float index)
{
	int row = (int)(index / _GPUSkinning_TextureSize_NumPixelsPerFrame.x);
	float col = index - row * _GPUSkinning_TextureSize_NumPixelsPerFrame.x;
	return vec4(col / _GPUSkinning_TextureSize_NumPixelsPerFrame.x, row / _GPUSkinning_TextureSize_NumPixelsPerFrame.y, 0.0, 0.0);
}


mat4 getMatrix(int frameStartIndex, float boneIndex)
{
	float matStartIndex = frameStartIndex + boneIndex * 3;
	vec4 row0 = texture2DLod(_GPUSkinning_TextureMatrix, indexToUV(matStartIndex));
	vec4 row1 = texture2DLod(_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 1));
	vec4 row2 = texture2DLod(_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 2));
	vec4 row3 = vec4(0.0, 0.0, 0.0, 1.0);
	mat4 mat = mat4(row0, row1, row2, row3);
	return mat;
}


float getFrameStartIndex()
{
	vec2 frameIndex_segment = _GPUSkinning_FrameIndex_PixelSegmentation;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
	float frameStartIndex = segment + frameIndex * _GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}

#ifdef !defined(ROOTON_BLENDOFF) && !defined(ROOTOFF_BLENDOFF)
float getFrameStartIndex_crossFade()
{
	vec3 frameIndex_segment = _GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
	float frameStartIndex = segment + frameIndex * _GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}
#endif

// bone0
// uv2.x = bone0.index
// uv2.y = bone0.weight
// bone1
// uv2.z = bone1.index
// uv2.w = bone1.weight
// bone2
// uv3.x = bone2.index
// uv3.y = bone2.weight
// bone3
// uv3.z = bone3.index
// uv3.w = bone3.weight
GPUSkingingTextureMatrixs textureMatrix(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s;
    float frameStartIndex = getFrameStartIndex();
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m2 = getMatrix(frameStartIndex, uv2.z);
    s.m3 = getMatrix(frameStartIndex, uv3.x);
    s.m4 = getMatrix(frameStartIndex, uv3.z);
    return s;
}

GPUSkingingTextureMatrixs textureMatrix_crossFade(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s;
    float frameStartIndex = getFrameStartIndex_crossFade();
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m2 = getMatrix(frameStartIndex, uv2.z);
    s.m3 = getMatrix(frameStartIndex, uv3.x);
    s.m4 = getMatrix(frameStartIndex, uv3.z);
    return s;
}

vec3 skin_blend(pos0, pos1)
{
    return pos1.xyz + (pos0.xyz - pos1.xyz) * _GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade.z;
} 


// SKILL_1 Begin
#ifdef SKILL_1

#ifdef ROOTOFF_BLENDOFF
vec4 skin1_noroot(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3)
{
    return mul(s.m0, vertex) * uv2.y;
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 skin1_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
{
    return mul(root, mul(s.m0, vertex)) * uv2.y;
}
#endif



#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin1_root(s, uv2, uv3, );
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 rootOn_BlendOff_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin1_noroot(s, uv2, uv3, _GPUSkinning_RootMotion);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin1_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin1_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
vec4 rootOff_BlendOn_CrossFadeRootOn_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_noroot(s0, uv2, uv3);
    vec4 pos1 = skin1_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
vec4 rootOff_BlendOn_CrossFadeRootOff_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_noroot(s0, uv2, uv3);
    vec4 pos1 = skin1_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


vec4 skin1(vec4 vertex, vec4 uv2, vec4 uv3)
{
    #ifdef ROOTOFF_BLENDOFF
        rootOff_BlendOff_1();
    #endif

    #ifdef ROOTON_BLENDOFF
        rootOn_BlendOff_1();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTON
        rootOn_BlendOn_CrossFadeRootOn_1();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
        rootOn_BlendOn_CrossFadeRootOff_1();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
        rootOff_BlendOn_CrossFadeRootOn_1();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
        rootOff_BlendOn_CrossFadeRootOff_1();
    #endif

    return vec4(0.0, 0.0, 0.0, 0.0);
}

#endif
// SKILL_1 End














// SKILL_2 Begin
#ifdef SKILL_2

#ifdef ROOTOFF_BLENDOFF
vec4 skin2_noroot(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3)
{
    return mul(s.m0, vertex) * uv2.y 
           + mul(s.m1, vertex) * uv2.w;
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 skin2_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
{
    return mul(root, mul(s.m0, vertex)) * uv2.y 
           + mul(root, mul(s.m1, vertex)) * uv2.w;
}
#endif



#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin2_root(s, uv2, uv3, );
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 rootOn_BlendOff_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin2_noroot(s, uv2, uv3, _GPUSkinning_RootMotion);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin2_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin2_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
vec4 rootOff_BlendOn_CrossFadeRootOn_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_noroot(s0, uv2, uv3);
    vec4 pos1 = skin2_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
vec4 rootOff_BlendOn_CrossFadeRootOff_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_noroot(s0, uv2, uv3);
    vec4 pos1 = skin2_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


vec4 skin2(vec4 vertex, vec4 uv2, vec4 uv3)
{
    #ifdef ROOTOFF_BLENDOFF
        rootOff_BlendOff_2();
    #endif

    #ifdef ROOTON_BLENDOFF
        rootOn_BlendOff_2();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTON
        rootOn_BlendOn_CrossFadeRootOn_2();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
        rootOn_BlendOn_CrossFadeRootOff_2();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
        rootOff_BlendOn_CrossFadeRootOn_2();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
        rootOff_BlendOn_CrossFadeRootOff_2();
    #endif

    return vec4(0.0, 0.0, 0.0, 0.0);
}

#endif
// SKILL_2 End











// SKILL_4 Begin
#ifdef SKILL_4

#ifdef ROOTOFF_BLENDOFF
vec4 skin4_noroot(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3)
{
    return mul(s.m0, vertex) * uv2.y 
           + mul(s.m1, vertex) * uv2.w
           + mul(s.m2, vertex) * uv3.y
           + mul(s.m3, vertex) * uv3.w;
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 skin4_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
{
    return mul(root, mul(s.m0, vertex)) * uv2.y 
           + mul(root, mul(s.m1, vertex)) * uv2.w
           + mul(root, mul(s.m2, vertex)) * uv3.y;
           + mul(root, mul(s.m3, vertex)) * uv3.w;
}
#endif



#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin4_root(s, uv2, uv3, );
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 rootOn_BlendOff_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin4_noroot(s, uv2, uv3, _GPUSkinning_RootMotion);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin4_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_root(s0, uv2, uv3, _GPUSkinning_RootMotion);
    vec4 pos1 = skin4_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
vec4 rootOff_BlendOn_CrossFadeRootOn_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_noroot(s0, uv2, uv3);
    vec4 pos1 = skin4_root(s1, uv2, uv3, _GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
vec4 rootOff_BlendOn_CrossFadeRootOff_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_noroot(s0, uv2, uv3);
    vec4 pos1 = skin4_noroot(s1, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


vec4 skin4(vec4 vertex, vec4 uv2, vec4 uv3)
{
    #ifdef ROOTOFF_BLENDOFF
        rootOff_BlendOff_4();
    #endif

    #ifdef ROOTON_BLENDOFF
        rootOn_BlendOff_4();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTON
        rootOn_BlendOn_CrossFadeRootOn_4();
    #endif

    #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
        rootOn_BlendOn_CrossFadeRootOff_4();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
        rootOff_BlendOn_CrossFadeRootOn_4();
    #endif

    #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
        rootOff_BlendOn_CrossFadeRootOff_4();
    #endif

    return vec4(0.0, 0.0, 0.0, 0.0);
}

#endif
// SKILL_4 End













#endif