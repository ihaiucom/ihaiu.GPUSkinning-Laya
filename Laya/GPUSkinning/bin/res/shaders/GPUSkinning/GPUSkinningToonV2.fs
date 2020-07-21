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

// 卡通材质 -- 阴影颜色
uniform vec4 u_CartoonShadowColor;
// 卡通材质 -- 颜色强度
uniform float u_CartoonColorRange;
// 卡通材质 -- 颜色强调
uniform float u_CartoonColorDeep;


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
	vec3 lightDir = vec3(120.0, -60.0, 0.0);
	vec3 lightColor = vec3(0.0, 0.0, 0.0);
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
	vec3 worldLightDir = normalize(lightDir);
	
	// 光入射方向L和视点方向V的中间向量
	vec3 halfLightViewDir = normalize(worldViewDir + worldLightDir);



	float _shadowAngleStep = 0.2;
	float _ShadowStrength = 0.358;
	vec4 baseColor = mainTexture * u_AlbedoColor;


	vec4 finalColor = baseColor;



	
	//==========================================
	// 边缘光
	//------------------------------------------
	vec3 rimColorA = vec3(1.0, 0.27, 0.25);
	vec3 rimColorB = vec3(1.0, 0.93, 0.75);
	vec3 rimColorC = vec3(0.2, 0.3, 0.5);
	float rimCSwitch = 1.0;

	float rimRateA = 0.5;
	float rimRateB = 0.45;
	rimRateB =  rimRateA + 0.05;

	vec3 rimViewDir0 = normalize(vec3(2.0, 0.0, -1));
	vec3 rimViewDir1 = normalize(vec3(10.0, 0.0, 1));
	vec3 rimViewDir2 = normalize(vec3(-30.0, -1.0, 0.5));

	float rimMask = heightRimLightTexture.r;

	float dotNormalView0 = dot(worldNormal, rimViewDir0);
	// dotNormalView0 = dotNormalView0 ;
	// dotNormalView0 = pow(dotNormalView0, 8.0);
	dotNormalView0 = (dotNormalView0 - 0.4) / 0.2;
	dotNormalView0 = max(dotNormalView0, 0.0);
	dotNormalView0 = min(dotNormalView0, 1.0);


	float dotNormalView1 = dot(worldNormal, rimViewDir1);
	dotNormalView1 = dotNormalView1 * 0.5 + 0.1;
	dotNormalView1 = max(dotNormalView1, 0.0);


	

	float rimMain = (dotNormalView1 - rimRateA) / (rimRateB - rimRateA);
	rimMain = max(rimMain, 0.0);
	rimMain = min(rimMain, 1.0);

	

	
	float dotNormalView2 = dot(worldNormal, rimViewDir2);
	dotNormalView2 = dotNormalView2 * 1.2 - 0.3;
	dotNormalView2 = max(dotNormalView2, 0.0);
	dotNormalView2 = pow(dotNormalView2, 2.0);

	vec3 gradientColor = lerp3(rimColorA, rimColorB, rimMain);
	vec3 rimMainColor0 = baseColor.rgb * rimColorB * dotNormalView0 * (1.0 - rimMask);
	vec3 rimMainColor1 = baseColor.rgb * gradientColor * dotNormalView1 * rimMask;
	vec3 rimColorLeft = rimColorC * dotNormalView2 * rimCSwitch;
	vec3 rimColor = rimMainColor0 + rimMainColor1 + rimColorLeft;

	finalColor.rgb += rimColor;

	


	// float v = heightRimLightTexture.g;
	// finalColor.rgb = vec3(v, v, v);
	// finalColor.rgb = worldNormal;
	// finalColor.rgb = gradientColor * dotNormalView1 * rimMask;
	// finalColor.rgb = rimMainColor1;

	
	
	//==========================================
	// 场景光照贴图
	//------------------------------------------
	// #ifdef SCENELIGHTING
	// 	vec4 sceneLighting = texture2D(u_SceneLightingTexture, v_SceneLightingUV);
	// 	// float brightness = step(0.5, sceneLighting.a) * sceneLighting.a * 0.25;
	// 	// finalColor.rgb += sceneLighting.rgb * brightness;
	// 	// finalColor.rgb -= step(sceneLighting.a, 0.5) * (0.25 - sceneLighting.a * 0.5);
		
	// 	float brightness =  sceneLighting.a - 0.5;
	// 	finalColor.rgb += sceneLighting.rgb * brightness;
	// #endif

	// float v = 1.0 - stepValue *  _ShadowStrength;
	// float v = shadowTexture.r;
	// float v = heightRimLightTexture.b;
	// finalColor.rgb = vec3(v, v, v);
	// finalColor.rgb = v_Normal;
	// finalColor.rgb = rimLightColor;


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

