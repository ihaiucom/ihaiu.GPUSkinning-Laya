precision highp float;

#include "Lighting.glsl";

uniform vec4 u_AlbedoColor;

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif


#ifdef SHADOWTEXTURE
	uniform sampler2D u_ShadowTexture;
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

void main()
{
	
	vec4 mainTexture = u_AlbedoColor;
	#ifdef ALBEDOTEXTURE
		mainTexture = texture2D(u_AlbedoTexture, v_Texcoord0);
	#endif 

	vec4 shadowTexture = vec4(0.0, 0.0, 0.0, 0.0);
	#ifdef SHADOWTEXTURE
		shadowTexture = texture2D(u_ShadowTexture, v_Texcoord0);
	#endif 


	
	#ifdef ALPHATEST
		if(mainTexture.a < u_AlphaTestValue)
			discard;
	#endif

	// 地面以下 抛弃
	if(v_PositionWorld.y < 0.0)
	{
		discard;
	}


	// 灯光方向
	vec3 lightDir = vec3(125.0, 68.0, 106.0);
	vec3 lightColor = vec3(0.0, 0.0, 0.0);
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			lightDir = u_DirectionLight.direction;
			lightColor = u_DirectionLight.color;
		#endif
	#else
		#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				lightDir = directionLight.direction;
				lightColor = directionLight.color;
			}
		#endif
	#endif

	
	vec3 worldNormal = normalize(v_Normal);
	vec3 worldViewDir= normalize(v_ViewDir);
	vec3 worldLightDir = normalize(lightDir);



	float _shadowAngleStep = 0.2;
	float _ShadowStrength = 0.358;
	vec4 finalColor = mainTexture;
	finalColor.rgb *= u_AlbedoColor.rgb;

	// 灯光和法线角度
	float angle = dot(worldLightDir, worldNormal);
	float stepValue = step(angle, _shadowAngleStep);
	
	#ifdef SHADOWTEXTURE
		_ShadowStrength = 0.358;
		// 灯光投影
		finalColor.rgb -= stepValue * (1.0 - shadowTexture.b) *  _ShadowStrength  * shadowTexture.g;
		
		// 画的褶皱阴影
		finalColor.rgb -= (1.0 - stepValue) * shadowTexture.r * _ShadowStrength * shadowTexture.g;
	#else
		_ShadowStrength = 0.1;
		// 灯光投影
		finalColor.rgb -= stepValue *  _ShadowStrength;
	#endif
	
	// 场景光照贴图
	#ifdef SCENELIGHTING
		vec4 sceneLighting = texture2D(u_SceneLightingTexture, v_SceneLightingUV);
		// float brightness = step(0.5, sceneLighting.a) * sceneLighting.a * 0.25;
		// finalColor.rgb += sceneLighting.rgb * brightness;
		// finalColor.rgb -= step(sceneLighting.a, 0.5) * (0.25 - sceneLighting.a * 0.5);
		
		float brightness =  sceneLighting.a - 0.5;
		finalColor.rgb += sceneLighting.rgb * brightness;
	#endif

	// float v = 1.0 - stepValue *  _ShadowStrength;
	// v = angle;
	// float v = shadowTexture.r;
	// finalColor.rgb = vec3(v, v, v);
	// finalColor.rgb = v_Normal;


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

