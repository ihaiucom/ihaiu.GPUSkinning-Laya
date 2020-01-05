

#ifndef GPUSKINNING_INCLUDE
#define GPUSKINNING_INCLUDE




uniform sampler2D u_GPUSkinning_TextureMatrix;
// x=textureWidth, y=textureHeight, z=bones.Length * 3 * 4
uniform vec3 u_GPUSkinning_TextureSize_NumPixelsPerFrame;
// x=frameIndex, y=playingClip.pixelSegmentation
uniform vec2 u_GPUSkinning_FrameIndex_PixelSegmentation;
// x=frameIndex_crossFade, y=lastPlayedClip.pixelSegmentation, z=crossFadeRate
uniform vec3 u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;

// 当前帧 根骨骼 逆矩阵
uniform mat4 u_GPUSkinning_RootMotion;

// 混合帧 根骨骼 逆矩阵
uniform mat4 u_GPUSkinning_RootMotion_CrossFade;


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
	float row = floor(index / u_GPUSkinning_TextureSize_NumPixelsPerFrame.x);
	float col = floor(index - row * u_GPUSkinning_TextureSize_NumPixelsPerFrame.x);
	return vec2(col / u_GPUSkinning_TextureSize_NumPixelsPerFrame.x, 0.0 - row / u_GPUSkinning_TextureSize_NumPixelsPerFrame.y);
}


float colorToFoat(vec4 c)
{
	return (c.x * 10000.0 + c.y * 100.0 + c.z) * (c.w * 10.0 - 1.0) * 0.01;
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

	// float matStartIndex = frameStartIndex + boneIndex * 3.0 * 4.0;
    
	float matStartIndex = boneIndex * 3.0 * 4.0;

    mat4 mat;
    vec4 r0;
    vec4 r1;
    vec4 r2;
    vec4 r3;

    r0.x = getColorFloat(matStartIndex + 0.0);
    r0.y = getColorFloat(matStartIndex + 1.0);
    r0.z = getColorFloat(matStartIndex + 2.0);
    r0.w = getColorFloat(matStartIndex + 3.0);

    matStartIndex += 4.0; 
    r1.x = getColorFloat(matStartIndex + 0.0);
    r1.y = getColorFloat(matStartIndex + 1.0);
    r1.z = getColorFloat(matStartIndex + 2.0);
    r1.w = getColorFloat(matStartIndex + 3.0);


    
    matStartIndex += 4.0; 
    r2.x = getColorFloat(matStartIndex + 0.0);
    r2.y = getColorFloat(matStartIndex + 1.0);
    r2.z = getColorFloat(matStartIndex + 2.0);
    r2.w = getColorFloat(matStartIndex + 3.0);


    r3.x = 0.0;
    r3.y = 0.0;
    r3.z = 0.0;
    r3.z = 1.0;

    mat = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    // mat = mat4(r0, r1, r2, r3);
    // mat = iMatrix(mat);
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
	vec2 frameIndex_segment = u_GPUSkinning_FrameIndex_PixelSegmentation;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
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
    s.m1 = getMatrix(frameStartIndex, uv2.z);
    s.m2 = getMatrix(frameStartIndex, uv3.x);
    s.m3 = getMatrix(frameStartIndex, uv3.z);
    return s;
}
/*
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
*/
vec3 skin_blend(vec4 pos0, vec4 pos1)
{
    return pos1.xyz + (pos0.xyz - pos1.xyz) * u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade.z;
} 


// // SKIN_1 Begin
// #ifdef SKIN_1

// #ifdef ROOTOFF_BLENDOFF
// vec4 skin1_noroot(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3)
// {
//     return mul(s.m0, vertex) * uv2.y;
// }
// #endif


// #ifdef ROOTON_BLENDOFF
// vec4 skin1_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
// {
//     return mul(root, mul(s.m0, vertex)) * uv2.y;
// }
// #endif



// #ifdef ROOTOFF_BLENDOFF
// vec4 rootOff_BlendOff_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
//     return skin1_root(s, uv2, uv3, );
// }
// #endif


// #ifdef ROOTON_BLENDOFF
// vec4 rootOn_BlendOff_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
//     return skin1_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
// }
// #endif


// #ifdef ROOTON_BLENDON_CROSSFADEROOTON
// vec4 rootOn_BlendOn_CrossFadeRootOn_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin1_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin1_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #if ROOTON_BLENDON_CROSSFADEROOTOFF
// vec4 rootOn_BlendOn_CrossFadeRootOff_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin1_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin1_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
// vec4 rootOff_BlendOn_CrossFadeRootOn_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin1_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin1_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
// vec4 rootOff_BlendOn_CrossFadeRootOff_1(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin1_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin1_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// vec4 skin1(vec4 vertex, vec4 uv2, vec4 uv3)
// {
//     #ifdef ROOTOFF_BLENDOFF
//         rootOff_BlendOff_1();
//     #endif

//     #ifdef ROOTON_BLENDOFF
//         rootOn_BlendOff_1();
//     #endif

//     #ifdef ROOTON_BLENDON_CROSSFADEROOTON
//         rootOn_BlendOn_CrossFadeRootOn_1();
//     #endif

//     #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
//         rootOn_BlendOn_CrossFadeRootOff_1();
//     #endif

//     #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
//         rootOff_BlendOn_CrossFadeRootOn_1();
//     #endif

//     #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
//         rootOff_BlendOn_CrossFadeRootOff_1();
//     #endif

//     return vec4(0.0, 0.0, 0.0, 0.0);
// }

// #endif
// // SKIN_1 End














// // SKIN_2 Begin
// #ifdef SKIN_2

// #ifdef ROOTOFF_BLENDOFF
// vec4 skin2_noroot(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3)
// {
//     return mul(s.m0, vertex) * uv2.y 
//            + mul(s.m1, vertex) * uv2.w;
// }
// #endif


// #ifdef ROOTON_BLENDOFF
// vec4 skin2_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
// {
//     return mul(root, mul(s.m0, vertex)) * uv2.y 
//            + mul(root, mul(s.m1, vertex)) * uv2.w;
// }
// #endif



// #ifdef ROOTOFF_BLENDOFF
// vec4 rootOff_BlendOff_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
//     return skin2_root(s, uv2, uv3, );
// }
// #endif


// #ifdef ROOTON_BLENDOFF
// vec4 rootOn_BlendOff_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
//     return skin2_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
// }
// #endif


// #ifdef ROOTON_BLENDON_CROSSFADEROOTON
// vec4 rootOn_BlendOn_CrossFadeRootOn_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin2_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin2_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #if ROOTON_BLENDON_CROSSFADEROOTOFF
// vec4 rootOn_BlendOn_CrossFadeRootOff_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin2_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin2_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
// vec4 rootOff_BlendOn_CrossFadeRootOn_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin2_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin2_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
// vec4 rootOff_BlendOn_CrossFadeRootOff_2(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin2_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin2_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// vec4 skin2(vec4 vertex, vec4 uv2, vec4 uv3)
// {
//     #ifdef ROOTOFF_BLENDOFF
//         rootOff_BlendOff_2();
//     #endif

//     #ifdef ROOTON_BLENDOFF
//         rootOn_BlendOff_2();
//     #endif

//     #ifdef ROOTON_BLENDON_CROSSFADEROOTON
//         rootOn_BlendOn_CrossFadeRootOn_2();
//     #endif

//     #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
//         rootOn_BlendOn_CrossFadeRootOff_2();
//     #endif

//     #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
//         rootOff_BlendOn_CrossFadeRootOn_2();
//     #endif

//     #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
//         rootOff_BlendOn_CrossFadeRootOff_2();
//     #endif

//     return vec4(0.0, 0.0, 0.0, 0.0);
// }

// #endif
// // SKIN_2 End












// SKIN_4 Begin
#ifdef SKIN_4

#ifdef ROOTOFF_BLENDOFF
vec4 skin4_noroot(GPUSkingingTextureMatrixs s, vec4 vertex, vec4 uv2, vec4 uv3)
{
    return s.m0 * vertex;
    // return mul__4(s.m0 , vertex );
    // return vertex + s.m0[0].x  ;
    // return vertex + s.m0 * vec4(1.0, 1.0, 1.0, 1.0) * 0.01 ;
    //  return s.m0 * vertex * uv2.y 
    //      + s.m1 * vertex * uv2.w 
    //      + s.m2 * vertex * uv3.y 
    //      + s.m3 * vertex * uv3.w ;
    // return vertex;
    // return s.m0 * vertex * uv2.w;
    //        + mul(s.m1, vertex) * uv2.w
    //        + mul(s.m2, vertex) * uv3.y
    //        + mul(s.m3, vertex) * uv3.w;
}
#endif


// #ifdef ROOTON_BLENDOFF
// vec4 skin4_root(GPUSkingingTextureMatrixs s, vec4 uv2, vec4 uv3, mat4 root)
// {
//     return mul(root, mul(s.m0, vertex)) * uv2.y 
//            + mul(root, mul(s.m1, vertex)) * uv2.w
//            + mul(root, mul(s.m2, vertex)) * uv3.y;
//            + mul(root, mul(s.m3, vertex)) * uv3.w;
// }
// #endif



#ifdef ROOTOFF_BLENDOFF
vec4 rootOff_BlendOff_4(vec4 vertex, vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
    return skin4_noroot(s, vertex, uv2, uv3);
}
#endif


// #ifdef ROOTON_BLENDOFF
// vec4 rootOn_BlendOff_4(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s = textureMatrix(uv2, uv3);
//     return skin4_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
// }
// #endif


// #ifdef ROOTON_BLENDON_CROSSFADEROOTON
// vec4 rootOn_BlendOn_CrossFadeRootOn_4(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin4_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin4_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #if ROOTON_BLENDON_CROSSFADEROOTOFF
// vec4 rootOn_BlendOn_CrossFadeRootOff_4(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin4_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
//     vec4 pos1 = skin4_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
// vec4 rootOff_BlendOn_CrossFadeRootOn_4(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin4_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin4_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


// #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
// vec4 rootOff_BlendOn_CrossFadeRootOff_4(vec4 uv2, vec4 uv3)
// {
//     GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
//     GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
//     vec4 pos0 = skin4_noroot(s0, uv2, uv3);
//     vec4 pos1 = skin4_noroot(s1, uv2, uv3);
//     return vec4(skin_blend(pos0, pos1), 1);
// }
// #endif


vec4 skin4(vec4 vertex, vec4 uv2, vec4 uv3)
{
    #ifdef ROOTOFF_BLENDOFF
        return rootOff_BlendOff_4(vertex, uv2, uv3);
    #endif

    // #ifdef ROOTON_BLENDOFF
    //     rootOn_BlendOff_4();
    // #endif

    // #ifdef ROOTON_BLENDON_CROSSFADEROOTON
    //     rootOn_BlendOn_CrossFadeRootOn_4();
    // #endif

    // #ifdef ROOTON_BLENDON_CROSSFADEROOTOFF
    //     rootOn_BlendOn_CrossFadeRootOff_4();
    // #endif

    // #ifdef ROOTOFF_BLENDON_CROSSFADEROOTON
    //     rootOff_BlendOn_CrossFadeRootOn_4();
    // #endif

    // #ifdef ROOTOFF_BLENDON_CROSSFADEROOTOFF
    //     rootOff_BlendOn_CrossFadeRootOff_4();
    // #endif

    return vec4(0.0, 0.0, 0.0, 0.0);
}

#endif
// SKIN_4 End













#endif