#define MAX_LIGHT_COUNT 32
#define MAX_LIGHT_COUNT_PER_CLUSTER 32
#define CLUSTER_X_COUNT 12
#define CLUSTER_Y_COUNT 12
#define CLUSTER_Z_COUNT 12
#define DIRECTIONLIGHT
#define UV
#ifdef HIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif
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
uniform vec4 u_DiffuseColor;
#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
	varying vec4 v_Color;
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	varying vec3 v_ViewDir; 
#endif
#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif
#ifdef DIFFUSEMAP
	uniform sampler2D u_DiffuseTexture;
#endif
#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))
	varying vec2 v_Texcoord0;
#endif
#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform sampler2D u_LightMap;
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	uniform vec3 u_MaterialSpecular;
	uniform float u_Shininess;
	#ifdef SPECULARMAP 
		uniform sampler2D u_SpecularTexture;
	#endif
#endif
#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	uniform vec3 u_FogColor;
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	varying vec3 v_Normal;
#endif
#if (defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&defined(NORMALMAP)
	uniform sampler2D u_NormalTexture;
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif
#ifdef DIRECTIONLIGHT
	uniform DirectionLight u_DirectionLight;
#endif
#ifdef POINTLIGHT
	uniform PointLight u_PointLight;
#endif
#ifdef SPOTLIGHT
	uniform SpotLight u_SpotLight;
#endif
uniform vec3 u_AmbientColor;
#if defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
	varying vec3 v_PositionWorld;
#endif
uniform sampler2D u_shadowMap1;
uniform sampler2D u_shadowMap2;
uniform sampler2D u_shadowMap3;
uniform vec2	  u_shadowPCFoffset;
uniform vec4     u_shadowPSSMDistance;
vec4 packDepth(const in float depth)
{
	const vec4 bitShift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
	const vec4 bitMask	= vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
	vec4 res = mod(depth*bitShift*vec4(255), vec4(256))/vec4(255);
	res -= res.xxyz * bitMask;
	return res;
}
float unpackDepth(const in vec4 rgbaDepth)
{
	const vec4 bitShift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
	float depth = dot(rgbaDepth, bitShift);
	return depth;
}
float tex2DPCF( sampler2D shadowMap,vec2 texcoord,vec2 invsize,float zRef )
{
	vec2 texelpos =texcoord / invsize;
	vec2 lerps = fract( texelpos );
	float sourcevals[4];
	sourcevals[0] = float( unpackDepth(texture2D(shadowMap,texcoord)) > zRef );
	sourcevals[1] = float( unpackDepth(texture2D(shadowMap,texcoord + vec2(invsize.x,0))) > zRef );
	sourcevals[2] = float( unpackDepth(texture2D(shadowMap,texcoord + vec2(0,invsize.y))) > zRef );
	sourcevals[3] = float( unpackDepth(texture2D(shadowMap,texcoord + vec2(invsize.x, invsize.y) )) > zRef );
	return mix( mix(sourcevals[0],sourcevals[2],lerps.y),mix(sourcevals[1],sourcevals[3],lerps.y),lerps.x );
}
float getShadowPSSM3( sampler2D shadowMap1,sampler2D shadowMap2,sampler2D shadowMap3,mat4 lightShadowVP[4],vec4 pssmDistance,vec2 shadowPCFOffset,vec3 worldPos,float posViewZ,float zBias )
{
	float value = 1.0;
	int nPSNum = int(posViewZ>pssmDistance.x);
	nPSNum += int(posViewZ>pssmDistance.y);
	nPSNum += int(posViewZ>pssmDistance.z);
	
	mat4 lightVP;
	if( nPSNum == 0 )
	{
		lightVP = lightShadowVP[1];
	}
	else if( nPSNum == 1 )
	{
		lightVP = lightShadowVP[2];
	}
	else if( nPSNum == 2 )
	{
		lightVP = lightShadowVP[3];
	}
	vec4 vLightMVPPos = lightVP * vec4(worldPos,1.0);
	
	
	vec3 vText = vLightMVPPos.xyz / vLightMVPPos.w;
	float fMyZ = vText.z - zBias;
	/*
	bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
	bool bInFrustum = all( bInFrustumVec );
	bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
	bool bFrustumTest = all( bFrustumTestVec );
	if ( bFrustumTest ) 
	*/
	if( fMyZ <= 1.0 )
	{
		float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
		if ( nPSNum == 0 )
		{
			value =  tex2DPCF( shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,	fMyZ );
			value = value/4.0;
		} 
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF2
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF1
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			vec4 color = texture2D( shadowMap2,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF_NO
		vec4 color;
		if ( nPSNum == 0 )
		{
			color = texture2D( shadowMap1,vText.xy );
		}
		else if( nPSNum == 1 )
		{
			color = texture2D( shadowMap2,vText.xy );
		}
		else if( nPSNum == 2 )
		{
			color = texture2D( shadowMap3,vText.xy );
		}
		zdepth = unpackDepth(color);
		value = float(fMyZ < zdepth);
#endif
	}
	return value;
}
float getShadowPSSM2( sampler2D shadowMap1,sampler2D shadowMap2,mat4 lightShadowVP[4],vec4 pssmDistance,vec2 shadowPCFOffset,vec3 worldPos,float posViewZ,float zBias )
{
	float value = 1.0;
	int nPSNum = int(posViewZ>pssmDistance.x);
	nPSNum += int(posViewZ>pssmDistance.y);
	
	mat4 lightVP;
	if( nPSNum == 0 )
	{
		lightVP = lightShadowVP[1];
	}
	else if( nPSNum == 1 )
	{
		lightVP = lightShadowVP[2];
	}
	vec4 vLightMVPPos = lightVP * vec4(worldPos,1.0);
	
	
	vec3 vText = vLightMVPPos.xyz / vLightMVPPos.w;
	float fMyZ = vText.z - zBias;
	/*
	bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
	bool bInFrustum = all( bInFrustumVec );
	bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
	bool bFrustumTest = all( bFrustumTestVec );
	if ( bFrustumTest ) 
	*/
	if( fMyZ <= 1.0 )
	{
		float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
		if ( nPSNum == 0 )
		{
			value =  tex2DPCF( shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,	fMyZ );
			value = value/4.0;
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
#endif
#ifdef SHADOWMAP_PCF2
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
#endif
#ifdef SHADOWMAP_PCF1
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			vec4 color = texture2D( shadowMap2,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF_NO
		vec4 color;
		if ( nPSNum == 0 )
		{
			color = texture2D( shadowMap1,vText.xy );
		}
		else if( nPSNum == 1 )
		{
			color = texture2D( shadowMap2,vText.xy );
		}
		zdepth = unpackDepth(color);
		value = float(fMyZ < zdepth);
#endif
	}
	return value;
}
float getShadowPSSM1( sampler2D shadowMap1,vec4 lightMVPPos,vec4 pssmDistance,vec2 shadowPCFOffset,float posViewZ,float zBias )
{
	float value = 1.0;
	if( posViewZ < pssmDistance.x )
	{
		vec3 vText = lightMVPPos.xyz / lightMVPPos.w;
		float fMyZ = vText.z - zBias;
		/*
		bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
		bool bInFrustum = all( bInFrustumVec );
		bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
		bool bFrustumTest = all( bFrustumTestVec );
		*/
		if ( fMyZ <= 1.0 ) 
		{
			float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
			value =  tex2DPCF( shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,fMyZ );
			value = value/4.0;
#endif
#ifdef SHADOWMAP_PCF2		
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
#endif
#ifdef SHADOWMAP_PCF1
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
#endif
#ifdef SHADOWMAP_PCF_NO		
			vec4 color = texture2D( shadowMap1,vText.xy );
			zdepth = unpackDepth(color);
			value = float(fMyZ < zdepth);
#endif
		}
	}
	return value;
}
varying float v_posViewZ;
#ifdef RECEIVESHADOW
	#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
		uniform mat4 u_lightShadowVP[4];
	#endif
	#ifdef SHADOWMAP_PSSM1 
		varying vec4 v_lightMVPPos;
	#endif
#endif
void main_castShadow()
{
	
	gl_FragColor=packDepth(v_posViewZ);
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		float alpha = texture2D(u_DiffuseTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}
float lerp(float a, float b, float w) 
{
  return a + w*(b-a);
}
void main_normal()
{
    vec4 _OutlineColor = vec4(0.0, 0.0, 0.0, 1.0);
	
	gl_FragColor = _OutlineColor;
}
void main()
{
	#ifdef CASTSHADOW		
		
	#else
		main_normal();
	#endif  
}