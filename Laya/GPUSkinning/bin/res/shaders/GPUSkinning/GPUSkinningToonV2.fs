precision highp float;

#include "Lighting.glsl";

uniform vec4 u_AlbedoColor;

// 主贴图
#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif


// 阴影贴图
#ifdef SHADOWTEXTURE
	uniform sampler2D u_ShadowTexture;
#endif

// 阴影颜色贴图
#ifdef SHADOWCOLORTEXTURE
	uniform sampler2D u_ShadowColorTexture;
#endif


// 高光和边缘光贴图
#ifdef HEIGHTRIMLIGHTTEXTURE
	uniform sampler2D u_HeightRimLightTexture;
#endif

#ifdef SCENELIGHTING
	// varying vec3 v_SceneLighting; 
	uniform sampler2D u_SceneLightingTexture;
	varying vec2 v_SceneLightingUV; 
#endif


#if defined(ALBEDOTEXTURE)||defined(SHADOWTEXTURE)
	varying vec2 v_Texcoord0;
#endif


#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif


#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	varying vec3 v_Normal;
	varying vec3 v_ViewDir; 


	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			uniform DirectionLight u_DirectionLight;
		#endif
	#else
		uniform int u_DirationLightCount;
		uniform sampler2D u_LightBuffer;
	#endif

#endif

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	#ifdef ADDTIVEFOG
	#else
		uniform vec3 u_FogColor;
	#endif
#endif

varying vec3 v_PositionWorld;

// 受击颜色
uniform vec4 u_DotRimColor;



uniform vec4 u_rimColorA0;
uniform vec4 u_rimColorA1;
uniform vec4 u_rimColorB;
uniform vec4 u_rimViewDirA0;
uniform vec4 u_rimViewDirB;


float lerp(float a, float b, float w) 
{
  return a + w*(b-a);
}


vec3 lerp3(vec3 a, vec3 b, float w) 
{
  return a + w*(b-a);
}

vec4 lerp4(vec4 a, vec4 b, float w) 
{
  return a + w*(b-a);
}

void main()
{
	
	vec4 mainTexture = u_AlbedoColor;
	#ifdef ALBEDOTEXTURE
		mainTexture = texture2D(u_AlbedoTexture, v_Texcoord0);
	#endif 

	
	// 高光和边缘光贴图
	vec4 heightRimLightTexture = vec4(1.0, 1.0, 1.0, 1.0);
	#ifdef HEIGHTRIMLIGHTTEXTURE
		heightRimLightTexture = texture2D(u_HeightRimLightTexture, v_Texcoord0);
	#endif 


	
	#ifdef ALPHATEST
		if(mainTexture.a < u_AlphaTestValue)
			discard;
	#endif

	// 地面以下 抛弃
	// if(v_PositionWorld.y < 0.0)
	// {
	// 	discard;
	// }


	// 灯光方向
	// vec3 lightDir = vec3(120.0, -60.0, 0.0);
	// vec3 lightColor = vec3(0.0, 0.0, 0.0);
	// #ifdef LEGACYSINGLELIGHTING
	// 	#ifdef DIRECTIONLIGHT
	// 		lightDir = u_DirectionLight.direction;
	// 		lightColor = u_DirectionLight.color;
	// 	#endif
	// #else
	// 	#ifdef DIRECTIONLIGHT
	// 		for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
	// 		{
	// 			if(i >= u_DirationLightCount)
	// 				break;
	// 			DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
	// 			lightDir = directionLight.direction;
	// 			lightColor = directionLight.color;
	// 		}
	// 	#endif
	// #endif

	
	vec3 worldNormal = normalize(v_Normal);
	vec3 worldViewDir= normalize(v_ViewDir);
	



	float _shadowAngleStep = 0.2;
	float _ShadowStrength = 0.358;
	vec4 baseColor = mainTexture * u_AlbedoColor;


	vec4 finalColor = baseColor;



	
	//==========================================
	// 边缘光
	//------------------------------------------
	// 战姬配置
	// vec3 rimColorA0 = vec3(1.0, 0.27, 0.25);
	// vec3 rimColorA1 = vec3(1.0, 0.93, 0.75);
	// vec3 rimColorB = vec3(0.2, 0.3, 0.5);

	// 龙骑配置
	// vec3 rimColorA0 = vec3(1.0, 0.02116402, 0.0);
	// vec3 rimColorA1 = vec3(1.0, 0.9290133, 0.759434);
	// vec3 rimColorB = vec3(1.0, 0.501811, 0.0);


	// rim颜色 AB一起渐变过度
	vec3 rimColorA0 = u_rimColorA0.rgb;
	vec3 rimColorA1 = u_rimColorA1.rgb;
	// rim颜色 另一侧
	vec3 rimColorB = u_rimColorB.rgb;

	vec3 rimViewDirA = normalize(u_rimViewDirA0.rgb);
	vec3 rimViewDirB = normalize(u_rimViewDirB.rgb);

	
	float rimRateA0 = u_rimViewDirA0.w;
	float rimRateA1 = u_rimViewDirB.w;
	float rimRange_C = u_rimColorB.w;

	float rimCSwitch = 1.0;



	float rimMask = heightRimLightTexture.r;

	// 方向A
	float dotNormalViewA = dot(worldNormal, rimViewDirA);
	dotNormalViewA = max(dotNormalViewA, 0.0);
	dotNormalViewA = min(dotNormalViewA, 1.0);

	
	

	// 方向A，渐变颜色rate
	float rimMain = (dotNormalViewA - rimRateA0) / (rimRateA1 - rimRateA0);
	rimMain = max(rimMain, 0.0);
	rimMain = min(rimMain, 1.0);
	

	// 方向B
	float dotNormalViewB = dot(worldNormal, rimViewDirB);
	dotNormalViewB = dotNormalViewB * 1.05 - rimRange_C;
	dotNormalViewB = max(dotNormalViewB, 0.0);
	dotNormalViewB = min(dotNormalViewB, 1.0);

	// 方向A, 渐变颜色
	vec3 gradientColor = lerp3(rimColorA0, rimColorA1, rimMain);

	// 方向A, 颜色
	vec3 rimMainColorA0 = baseColor.rgb * gradientColor * dotNormalViewA * rimMask;
	vec3 rimMainColorA1 = baseColor.rgb * rimColorA1 * rimMain * (1.0 - rimMask);
	
	// 方向B，颜色
	vec3 rimMainColorB = rimColorB * dotNormalViewB * rimCSwitch;
	vec3 rimColor =   rimMainColorA0 + rimMainColorA1 + rimMainColorB;

	finalColor.rgb += rimColor;






	// 受击
	float dotNV = dot(worldNormal, worldViewDir);
	dotNV = max(0.0, dotNV);
	finalColor.rgb = finalColor.rgb + u_DotRimColor.rgb * u_DotRimColor.a  * dotNV ;

	// 霸体
	#ifdef IS_SUPERARMOR
		float dotSuperarmor = dot(worldNormal, worldViewDir);
		dotSuperarmor = max(0.0, dotSuperarmor);
		vec3 superarmorColorA = vec3(1.0, 0.7, 0.0);
		finalColor.rgb = finalColor.rgb * 0.5 + superarmorColorA * dotSuperarmor ;
	#endif


	// 分身
	#ifdef IS_SPEARATION
		float separation = 0.5;
		finalColor.rgb = finalColor.rgb * (1.0- separation)  + vec3(separation, separation, separation);
	#endif

	gl_FragColor = finalColor;

	
	
	#ifdef FOG
		float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
		#ifdef ADDTIVEFOG
			gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lerpFact);
		#else
			gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
		#endif
	#endif
	
}

