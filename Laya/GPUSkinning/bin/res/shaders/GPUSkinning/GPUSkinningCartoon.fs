precision highp float;

#include "Lighting.glsl";

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
	varying vec2 v_Texcoord0;
#endif

uniform vec4 u_AlbedoColor;

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
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			lightDir = u_DirectionLight.direction;
		#endif
	#else
		#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				lightDir = directionLight.direction;
			}
		#endif
	#endif

	
	vec3 worldNormal = normalize(v_Normal);
	vec3 worldViewDir= normalize(v_ViewDir);
	vec3 worldLightDir = normalize(lightDir);


	// 环境灯光
	vec3 ambient = vec3(0.2117647, 0.227451, 0.2588235);
	// ambient = u_AmbientColor;


	// 灯光和法线角度
	float angle = (1.0 - max(0.0, dot(worldLightDir, worldNormal) ) );

	// 灯光和法线角度， 值加深
	float angleExp = clamp(pow(angle, u_CartoonColorDeep), 0.0, u_CartoonColorRange);


	vec3 emissive = (
						(
							(mainTexture.rgb - angleExp)
							+
							(u_CartoonShadowColor.rgb * angleExp)
						)
						+
						(
							(mainTexture.rgb * u_AlbedoColor.rgb)
							*
							ambient
						)
					);

	vec4 finalColor = vec4(emissive, mainTexture.a) ;
	// vec4 finalColor = mainTexture ;

	
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

