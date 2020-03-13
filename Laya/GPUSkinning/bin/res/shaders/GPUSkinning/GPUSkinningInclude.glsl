

#ifndef GPUSKINNING_INCLUDE
#define GPUSKINNING_INCLUDE




uniform sampler2D u_GPUSkinning_TextureMatrix;
// x=textureWidth, y=textureHeight, z=bones.Length * 3 * 4
uniform vec3 u_GPUSkinning_TextureSize_NumPixelsPerFrame;
// x=frameIndex, y=playedClip.pixelSegmentation , z=NextFrameIndex, w=NextFrameFade
uniform vec4 u_GPUSkinning_FrameIndex_PixelSegmentation;
// x=frameIndex_crossFade, y=lastPlayedClip.pixelSegmentation, z=crossFadeRate
uniform vec3 u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;

// 当前帧 根骨骼 逆矩阵
uniform mat4 u_GPUSkinning_RootMotion;

// 混合帧 根骨骼 逆矩阵
uniform mat4 u_GPUSkinning_RootMotion_CrossFade;

uniform mat4 frameMaterial;

mat4 skinTransform;

struct GPUSkingingTextureMatrixs
{
	float frameStartIndex;
	mat4 m0;
	mat4 m1;
	mat4 m2;
	mat4 m3;
};

vec2 indexToUV(float index)
{
    float w = u_GPUSkinning_TextureSize_NumPixelsPerFrame.x;
    float h = u_GPUSkinning_TextureSize_NumPixelsPerFrame.y;
	float row = floor(index / w);
	float col = floor(index - row * w);
	return vec2(col / w,  row / h);
}


float colorToFoat(vec4 c)
{
	return (c.x * 10000.0 + c.y * 100.0 + c.z) * (c.w * 10.0 - 1.0);
}

float colorToFoat2(vec4 c)
{
	return (c.x * 100.0 + c.y  + c.z * 0.01) * (c.w * 10.0 - 1.0) ;
}

float getColorFloat(float piexelIndex)
{
    vec4 c = texture2D(u_GPUSkinning_TextureMatrix, indexToUV(piexelIndex));
    return colorToFoat(c);
}


mat4 iMatrix(mat4 m)
{
    mat4 n = mat4 (
        m[0].x, m[1].x, m[2].x, m[3].x,
        m[0].y, m[1].y, m[2].y, m[3].y,
        m[0].z, m[1].z, m[2].z, m[3].z,
        m[0].w, m[1].w, m[2].w, m[3].w
    );

    return n;
}



mat4 getMatrix(float frameStartIndex, float boneIndex)
{

	float matStartIndex = frameStartIndex + boneIndex * 3.0;

    mat4 mat;
    vec4 r0 = texture2D(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 0.0));
    vec4 r1 = texture2D(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 1.0));
    vec4 r2 = texture2D(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 2.0));
    vec4 r3 = vec4(0.0, 0.0, 0.0, 1.0);


    mat = mat4(
        r0.x, r1.x, r2.x, r3.x,
        r0.y, r1.y, r2.y, r3.y,
        r0.z, r1.z, r2.z, r3.z,
        r0.w, r1.w, r2.w, r3.w
        );


	return mat;
}



float getFrameStartIndex()
{
	vec4 frameIndex_segment = u_GPUSkinning_FrameIndex_PixelSegmentation;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
	float frameStartIndex = segment + frameIndex * u_GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}


float getFrameNextIndex()
{
	vec4 frameIndex_segment = u_GPUSkinning_FrameIndex_PixelSegmentation;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.z;
	float frameStartIndex = segment + frameIndex * u_GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}

float getFrameStartIndex_crossFade()
{
	vec3 frameIndex_segment = u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
	float frameStartIndex = segment + frameIndex * u_GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}


vec3 skin_blend(vec4 pos0, vec4 pos1)
{
    return pos0.xyz + (pos1.xyz - pos0.xyz) * u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade.z;
} 


vec3 skin_blend_next(vec4 pos0, vec4 pos1)
{
    return pos0.xyz + (pos1.xyz - pos0.xyz) * u_GPUSkinning_FrameIndex_PixelSegmentation.w;
    // return pos1.xyz + (pos0.xyz - pos1.xyz) * 0.0;
    // return pos1.xyz;
} 

#ifdef SKIN_1

GPUSkingingTextureMatrixs textureMatrix(vec4 uv2, vec4 uv3, float frameStartIndex)
{
    GPUSkingingTextureMatrixs s;
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    return s;
}

GPUSkingingTextureMatrixs textureMatrix_crossFade(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s;
    float frameStartIndex = getFrameStartIndex_crossFade();
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    return s;
}

vec4 skin_noroot(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3)
{
     return s.m0 * vertex * uv2.y ;
}

vec4 skin_root(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3, mat4 root)
{
     return (root * (s.m0 * vertex)) * uv2.y ;
}
#endif




#ifdef SKIN_2

GPUSkingingTextureMatrixs textureMatrix(vec4 uv2, vec4 uv3, float frameStartIndex)
{
    GPUSkingingTextureMatrixs s;
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m1 = getMatrix(frameStartIndex, uv2.z);
    return s;
}

GPUSkingingTextureMatrixs textureMatrix_crossFade(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s;
    float frameStartIndex = getFrameStartIndex_crossFade();
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m1 = getMatrix(frameStartIndex, uv2.z);
    return s;
}



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
#endif




#ifdef SKIN_4


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
GPUSkingingTextureMatrixs textureMatrix(vec4 uv2, vec4 uv3, float frameStartIndex)
{
    GPUSkingingTextureMatrixs s;
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m1 = getMatrix(frameStartIndex, uv2.z);
    s.m2 = getMatrix(frameStartIndex, uv3.x);
    s.m3 = getMatrix(frameStartIndex, uv3.z);
    return s;
}

GPUSkingingTextureMatrixs textureMatrix_crossFade(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s;
    float frameStartIndex = getFrameStartIndex_crossFade();
    s.frameStartIndex = frameStartIndex;
    s.m0 = getMatrix(frameStartIndex, uv2.x);
    s.m1 = getMatrix(frameStartIndex, uv2.z);
    s.m2 = getMatrix(frameStartIndex, uv3.x);
    s.m3 = getMatrix(frameStartIndex, uv3.z);
    return s;
}


vec4 skin_noroot(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3)
{
     return s.m0 * vertex * uv2.y 
         + s.m1 * vertex * uv2.w 
         + s.m2 * vertex * uv3.y 
         + s.m3 * vertex * uv3.w ;
}

vec4 skin_root(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3, mat4 root)
{
    // skinTransform = s.m0 * uv2.y
    //             + s.m1 * uv2.w
    //             + s.m2 * uv3.y
    //             + s.m3 * uv3.w;
    //  return root * skinTransform * vertex;
     return (root * (s.m0 * vertex)) * uv2.y 
         + (root * (s.m1 * vertex)) * uv2.w 
         + (root * (s.m2 * vertex)) * uv3.y 
         + (root * (s.m3 * vertex)) * uv3.w ;
}

#endif









#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    float frameNextIndex = getFrameNextIndex();
    GPUSkingingTextureMatrixs sc = textureMatrix(uv2, uv3, frameStartIndex);
    GPUSkingingTextureMatrixs sn = textureMatrix(uv2, uv3, frameNextIndex);

    skinTransform = sc.m0 * uv2.y
                + sc.m1 * uv2.w
                + sc.m2 * uv3.y
                + sc.m3 * uv3.w;
    
    vec4 pc = skin_noroot(sc, vertex, uv2, uv3);
    vec4 pn = skin_noroot(sn, vertex, uv2, uv3);
    return vec4(skin_blend_next(pc, pn), 1);
}
#endif


#ifdef ROOTON_BLENDOFF
vec4 rootOn_BlendOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3, frameStartIndex);
    return skin_root(s, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3, frameStartIndex);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_root(s0, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin_root(s1, vertex, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3, frameStartIndex);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_root(s0, vertex, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin_noroot(s1, vertex, uv2, uv3);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
vec4 rootOff_BlendOn_CrossFadeRootOn(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3, frameStartIndex);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin_noroot(s0, vertex, uv2, uv3);
    vec4 pos1 = skin_root(s1, vertex, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif


#ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
vec4 rootOff_BlendOn_CrossFadeRootOff(vec4 vertex, vec4 uv2, vec4 uv3)
{
    float frameStartIndex = getFrameStartIndex();
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3, frameStartIndex);
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