#define MAX_LIGHT_COUNT 32
#define MAX_LIGHT_COUNT_PER_CLUSTER 32
#define CLUSTER_X_COUNT 12
#define CLUSTER_Y_COUNT 12
#define CLUSTER_Z_COUNT 12
#define DIRECTIONLIGHT
#define UV
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
attribute vec4 a_Position;
#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif
#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))||(defined(LIGHTMAP)&&defined(UV))
	attribute vec2 a_Texcoord0;
	varying vec2 v_Texcoord0;
#endif
#if defined(LIGHTMAP)&&defined(UV1)
	attribute vec2 a_Texcoord1;
#endif
uniform float u_OutlineWidth;
#ifdef LIGHTMAP
	uniform vec4 u_LightmapScaleOffset;
	varying vec2 v_LightMapUV;
#endif
#ifdef COLOR
	attribute vec4 a_Color;
	varying vec4 v_Color;
#endif
#ifdef BONE
	const int c_MaxBoneCount = 24;
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	uniform mat4 u_Bones[c_MaxBoneCount];
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	attribute vec3 a_Normal;
	varying vec3 v_Normal; 
	uniform vec3 u_CameraPos;
	varying vec3 v_ViewDir; 
#endif
#if (defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&defined(NORMALMAP)
	attribute vec4 a_Tangent0;
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
	#ifdef GPU_INSTANCE
		attribute mat4 a_WorldMat;
	#else
		uniform mat4 u_WorldMat;
	#endif
	varying vec3 v_PositionWorld;
#endif
varying float v_posViewZ;
#ifdef RECEIVESHADOW
  #ifdef SHADOWMAP_PSSM1 
  varying vec4 v_lightMVPPos;
  uniform mat4 u_lightShadowVP[4];
  #endif
#endif
#ifdef TILINGOFFSET
	uniform vec4 u_TilingOffset;
#endif
void main_castShadow()
{
	vec4 position;
	#ifdef BONE
		mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		position=skinTransform*a_Position;
	#else
		position=a_Position;
	#endif
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif
	
	
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		v_Texcoord0=a_Texcoord0;
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
	v_posViewZ = gl_Position.z;
}
void main_normal()
{
    
        
        
	vec4 position;
	#ifdef BONE
		mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		position=skinTransform*a_Position;
	#else
		position=a_Position;
	#endif
	
	
    position = vec4(position.xyz + a_Normal * u_OutlineWidth, 1.0); 
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif
	
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
		mat4 worldMat;
		#ifdef GPU_INSTANCE
			worldMat = a_WorldMat;
		#else
			worldMat = u_WorldMat;
		#endif
	#endif
	
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		mat3 worldInvMat;
		#ifdef BONE
			worldInvMat=inverse(mat3(worldMat*skinTransform));
		#else
			worldInvMat=inverse(mat3(worldMat));
		#endif  
		v_Normal=a_Normal*worldInvMat;
		#if (defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&defined(NORMALMAP)
			v_Tangent=a_Tangent0.xyz*worldInvMat;
			v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;
		#endif
	#endif
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
		v_PositionWorld=(worldMat*position).xyz;
	#endif
	
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		v_ViewDir=u_CameraPos-v_PositionWorld;
	#endif
	#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))
		#ifdef TILINGOFFSET
			v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
		#else
			v_Texcoord0=a_Texcoord0;
		#endif
	#endif
	#ifdef LIGHTMAP
		#ifdef SCALEOFFSETLIGHTINGMAPUV
			#ifdef UV1
				v_LightMapUV=vec2(a_Texcoord1.x,1.0-a_Texcoord1.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;
			#else
				v_LightMapUV=vec2(a_Texcoord0.x,1.0-a_Texcoord0.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;
			#endif 
			v_LightMapUV.y=1.0-v_LightMapUV.y;
		#else
			#ifdef UV1
				v_LightMapUV=a_Texcoord1;
			#else
				v_LightMapUV=a_Texcoord0;
			#endif 
		#endif 
	#endif
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color=a_Color;
	#endif
	#ifdef RECEIVESHADOW
		v_posViewZ = gl_Position.w;
		#ifdef SHADOWMAP_PSSM1 
			v_lightMVPPos = u_lightShadowVP[0] * vec4(v_PositionWorld,1.0);
		#endif
	#endif
	
	gl_Position=remapGLPositionZ(gl_Position);
}
void main()
{
	#ifdef CASTSHADOW
		main_castShadow();
	#else
		main_normal();
	#endif
}