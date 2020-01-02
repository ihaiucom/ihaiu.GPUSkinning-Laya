#define MAX_LIGHT_COUNT 32
#define MAX_LIGHT_COUNT_PER_CLUSTER 32
#define CLUSTER_X_COUNT 12
#define CLUSTER_Y_COUNT 12
#define CLUSTER_Z_COUNT 12
#define ALBEDOTEXTURE
#define ROOTOFF_BLENDOFF
struct DirectionLight {
	vec3 color;
	vec3 direction;
};
struct PointLight {
	vec3 color;
	vec3 position;
	float range;
};
struct SpotLight {
	vec3 color;
	vec3 position;
	float range;
	vec3 direction;
	float spot;
};
const int c_ClusterBufferWidth = CLUSTER_X_COUNT*CLUSTER_Y_COUNT;
const int c_ClusterBufferHeight = CLUSTER_Z_COUNT*(1+int(ceil(float(MAX_LIGHT_COUNT_PER_CLUSTER)/4.0)));
const int c_ClusterBufferFloatWidth = c_ClusterBufferWidth*4;
ivec4 getClusterInfo(sampler2D clusterBuffer,mat4 viewMatrix,vec4 viewport,vec3 position,vec4 fragCoord,vec4 projectParams)
{
	vec3 viewPos = vec3(viewMatrix*vec4(position, 1.0)); 
	int clusterXIndex = int(floor(fragCoord.x/ (float(viewport.z)/float(CLUSTER_X_COUNT))));
    int clusterYIndex = int(floor((viewport.w * (projectParams.z <0.0? 0.0 : 1.0) - fragCoord.y * projectParams.z)/ (float(viewport.w)/float(CLUSTER_Y_COUNT))));
	float zSliceParam =float(CLUSTER_Z_COUNT)/log2(projectParams.y / projectParams.x);
 	int clusterZIndex = int(floor(log2(-viewPos.z) * zSliceParam- log2(projectParams.x) * zSliceParam));
	vec2 uv= vec2((float(clusterXIndex + clusterYIndex * CLUSTER_X_COUNT)+0.5)/float(c_ClusterBufferWidth),
				(float(clusterZIndex)+0.5)/float(c_ClusterBufferHeight));
	vec4 clusterPixel=texture2D(clusterBuffer, uv);
	return ivec4(clusterPixel);
}
int getLightIndex(sampler2D clusterBuffer,int offset,int index) 
{
	int totalOffset=offset+index;
	int row=totalOffset/c_ClusterBufferFloatWidth;
	int lastRowFloat=totalOffset-row*c_ClusterBufferFloatWidth;
	int col=lastRowFloat/4;
	vec2 uv=vec2((float(col)+0.5)/float(c_ClusterBufferWidth),
				(float(row)+0.5)/float(c_ClusterBufferHeight));
	vec4 texel = texture2D(clusterBuffer, uv);
    int pixelComponent = lastRowFloat-col*4;
    if (pixelComponent == 0) 
      return int(texel.x);
    else if (pixelComponent == 1) 
      return int(texel.y);
    else if (pixelComponent == 2) 
      return int(texel.z);
    else if (pixelComponent == 3) 
      return int(texel.w);
}
DirectionLight getDirectionLight(sampler2D lightBuffer,int index) 
{
    DirectionLight light;
    float v = (float(index)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	light.color=p1.rgb;
    light.direction = p2.rgb;
    return light;
}
PointLight getPointLight(sampler2D lightBuffer,sampler2D clusterBuffer,ivec4 clusterInfo,int index) 
{
    PointLight light;
	int pointIndex=getLightIndex(clusterBuffer,clusterInfo.z*c_ClusterBufferFloatWidth+clusterInfo.w,index);
    float v = (float(pointIndex)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	light.color=p1.rgb;
	light.range = p1.a;
    light.position = p2.rgb;
    return light;
}
SpotLight getSpotLight(sampler2D lightBuffer,sampler2D clusterBuffer,ivec4 clusterInfo,int index) 
{
    SpotLight light;
	int spoIndex=getLightIndex(clusterBuffer,clusterInfo.z*c_ClusterBufferFloatWidth+clusterInfo.w,clusterInfo.x+index);
    float v = (float(spoIndex)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	vec4 p3 = texture2D(lightBuffer, vec2(0.625,v));
    light.color = p1.rgb;
	light.range=p1.a;
    light.position = p2.rgb;
	light.spot = p2.a;
	light.direction = p3.rgb;
    return light;
}
float LayaAttenuation(in vec3 L,in float invLightRadius) {
	float fRatio = clamp(length(L) * invLightRadius,0.0,1.0);
	fRatio *= fRatio;
	return 1.0 / (1.0 + 25.0 * fRatio)* clamp(4.0*(1.0 - fRatio),0.0,1.0); 
}
float BasicAttenuation(in vec3 L,in float invLightRadius) {
	vec3 distance = L * invLightRadius;
	float attenuation = clamp(1.0 - dot(distance, distance),0.0,1.0); 
	return attenuation * attenuation;
}
float NaturalAttenuation(in vec3 L,in float invLightRadius) {
	float attenuationFactor = 30.0;
	vec3 distance = L * invLightRadius;
	float attenuation = dot(distance, distance); 
	attenuation = 1.0 / (attenuation * attenuationFactor + 1.0);
	
	attenuationFactor = 1.0 / (attenuationFactor + 1.0); 
	attenuation = max(attenuation - attenuationFactor, 0.0); 
	
	attenuation /= 1.0 - attenuationFactor;
	return attenuation;
}
void LayaAirBlinnPhongLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir,in vec3 lightColor, in vec3 lightVec,out vec3 diffuseColor,out vec3 specularColor) {
	mediump vec3 h = normalize(viewDir-lightVec);
	lowp float ln = max (0.0, dot (-lightVec,normal));
	float nh = max (0.0, dot (h,normal));
	diffuseColor=lightColor * ln;
	specularColor=lightColor *specColor*pow (nh, specColorIntensity*128.0) * gloss;
}
void LayaAirBlinnPhongDiectionLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in DirectionLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec=normalize(light.direction);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec,diffuseColor,specularColor);
}
void LayaAirBlinnPhongPointLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in PointLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.position;
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec/length(lightVec),diffuseColor,specularColor);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range);
	diffuseColor *= attenuate;
	specularColor*= attenuate;
}
void LayaAirBlinnPhongSpotLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in SpotLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.position;
	vec3 normalLightVec=lightVec/length(lightVec);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,normalLightVec,diffuseColor,specularColor);
	vec2 cosAngles=cos(vec2(light.spot,light.spot*0.5)*0.5);
	float dl=dot(normalize(light.direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range)*dl;
	diffuseColor *=attenuate;
	specularColor *=attenuate;
}
vec3 NormalSampleToWorldSpace(vec3 normalMapSample, vec3 unitNormal, vec3 tangent,vec3 binormal) {
	vec3 normalT =vec3(2.0*normalMapSample.x - 1.0,1.0-2.0*normalMapSample.y,2.0*normalMapSample.z - 1.0);
	
	vec3 N = normalize(unitNormal);
	vec3 T = normalize(tangent);
	vec3 B = normalize(binormal);
	mat3 TBN = mat3(T, B, N);
	
	vec3 bumpedNormal = TBN*normalT;
	return bumpedNormal;
}
vec3 NormalSampleToWorldSpace1(vec4 normalMapSample, vec3 tangent, vec3 binormal, vec3 unitNormal) {
	vec3 normalT;
	normalT.x = 2.0 * normalMapSample.x - 1.0;
	normalT.y = 1.0 - 2.0 * normalMapSample.y;
	normalT.z = sqrt(1.0 - clamp(dot(normalT.xy, normalT.xy), 0.0, 1.0));
	vec3 T = normalize(tangent);
	vec3 B = normalize(binormal);
	vec3 N = normalize(unitNormal);
	mat3 TBN = mat3(T, B, N);
	
	vec3 bumpedNormal = TBN * normalize(normalT);
	return bumpedNormal;
}
vec3 DecodeLightmap(vec4 color) {
	return color.rgb*color.a*5.0;
}
vec2 TransformUV(vec2 texcoord,vec4 tilingOffset) {
	vec2 transTexcoord=vec2(texcoord.x,texcoord.y-1.0)*tilingOffset.xy+vec2(tilingOffset.z,-tilingOffset.w);
	transTexcoord.y+=1.0;
	return transTexcoord;
}
vec4 remapGLPositionZ(vec4 position) {
	position.z=position.z * 2.0 - position.w;
	return position;
}
mat3 inverse(mat3 m) {
  float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
  float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
  float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];
  float b01 = a22 * a11 - a12 * a21;
  float b11 = -a22 * a10 + a12 * a20;
  float b21 = a21 * a10 - a11 * a20;
  float det = a00 * b01 + a01 * b11 + a02 * b21;
  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
              b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
              b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}
#ifndef GPUSKINNING_INCLUDE
#define GPUSKINNING_INCLUDE
uniform sampler2D u_GPUSkinning_TextureMatrix;
uniform vec3 u_GPUSkinning_TextureSize_NumPixelsPerFrame;
uniform vec2 u_GPUSkinning_FrameIndex_PixelSegmentation;
uniform vec3 u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;
uniform mat4 u_GPUSkinning_RootMotion;
uniform mat4 u_GPUSkinning_RootMotion_CrossFade;
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
	int row = (int)(index / u_GPUSkinning_TextureSize_NumPixelsPerFrame.x);
	float col = index - row * u_GPUSkinning_TextureSize_NumPixelsPerFrame.x;
	return vec4(col / u_GPUSkinning_TextureSize_NumPixelsPerFrame.x, row / u_GPUSkinning_TextureSize_NumPixelsPerFrame.y, 0.0, 0.0);
}
mat4 getMatrix(int frameStartIndex, float boneIndex)
{
	float matStartIndex = frameStartIndex + boneIndex * 3;
	vec4 row0 = texture2DLod(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex));
	vec4 row1 = texture2DLod(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 1));
	vec4 row2 = texture2DLod(u_GPUSkinning_TextureMatrix, indexToUV(matStartIndex + 2));
	vec4 row3 = vec4(0.0, 0.0, 0.0, 1.0);
	mat4 mat = mat4(row0, row1, row2, row3);
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
#ifdef !defined(ROOTON_BLENDOFF) && !defined(ROOTOFF_BLENDOFF)
float getFrameStartIndex_crossFade()
{
	vec3 frameIndex_segment = u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade;
	float segment = frameIndex_segment.y;
	float frameIndex = frameIndex_segment.x;
	float frameStartIndex = segment + frameIndex * u_GPUSkinning_TextureSize_NumPixelsPerFrame.z;
	return frameStartIndex;
}
#endif
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
    return pos1.xyz + (pos0.xyz - pos1.xyz) * u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade.z;
} 
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
    return skin1_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
}
#endif
#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin1_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif
#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_1(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin1_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
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
    vec4 pos1 = skin1_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
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
    return skin2_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
}
#endif
#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin2_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif
#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_2(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin2_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
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
    vec4 pos1 = skin2_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
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
    return skin4_noroot(s, uv2, uv3, u_GPUSkinning_RootMotion);
}
#endif
#ifdef ROOTON_BLENDON_CROSSFADEROOTON
vec4 rootOn_BlendOn_CrossFadeRootOn_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
    vec4 pos1 = skin4_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
    return vec4(skin_blend(pos0, pos1), 1);
}
#endif
#if ROOTON_BLENDON_CROSSFADEROOTOFF
vec4 rootOn_BlendOn_CrossFadeRootOff_4(vec4 uv2, vec4 uv3)
{
    GPUSkingingTextureMatrixs s0 = textureMatrix(uv2, uv3);
    GPUSkingingTextureMatrixs s1 = textureMatrix_crossFade(uv2, uv3);
    vec4 pos0 = skin4_root(s0, uv2, uv3, u_GPUSkinning_RootMotion);
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
    vec4 pos1 = skin4_root(s1, uv2, uv3, u_GPUSkinning_RootMotion_CrossFade);
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
#endif
attribute vec4 a_Position;
attribute vec2 a_Texcoord0;
attribute vec4 a_Texcoord1;
attribute vec4 a_Texcoord2;
attribute vec4 a_Color;
#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif
varying vec2 v_Texcoord0;
varying vec4 v_Color;
void main() 
{
	vec4 position;
	#ifdef SKILL_1
        position= skin1(a_Position, a_Texcoord1, a_Texcoord2);
	#endif
    
	#ifdef SKILL_2
        position= skin2(a_Position, a_Texcoord1, a_Texcoord2);
	#endif
	#ifdef SKILL_4
        position= skin4(a_Position, a_Texcoord1, a_Texcoord2);
	#endif
    
    
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif
    
    v_Texcoord0 = a_Texcoord0;
    
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}