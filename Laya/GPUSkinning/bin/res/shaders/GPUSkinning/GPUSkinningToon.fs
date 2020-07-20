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

	// 阴影贴图
	vec4 shadowTexture = vec4(0.0, 0.0, 0.0, 0.0);
	#ifdef SHADOWTEXTURE
		shadowTexture = texture2D(u_ShadowTexture, v_Texcoord0);
	#endif 


	// 阴影颜色贴图
	vec4 shadowColorTexture = vec4(0.0, 0.0, 0.0, 1.0);
	#ifdef SHADOWCOLORTEXTURE
		shadowColorTexture = texture2D(u_ShadowColorTexture, v_Texcoord0);
	#else
		shadowColorTexture = mainTexture * 0.6;
	#endif 
	
	// 高光和边缘光贴图
	vec4 heightRimLightTexture = vec4(0.0, 0.0, 1.0, 1.0);
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
	// 计算光照：阴影
	//------------------------------------------
	
	// 属性参数--阴影--范围
	float _1st_ShadeColor_Step = 0.5;
	// 属性参数--阴影--羽化
	float _1st_ShadeColor_Feather = 0.25;


	// 灯光和法线角度
	float angle = dot(worldLightDir, worldNormal);
	float halfLambertValue = angle * 0.5 + 0.5;
	float stepValue = step(angle, _shadowAngleStep);


	float shadowValue = 1.0 
		+ 
		(
			halfLambertValue 
			- 
			// 阴影范围 - 阴影羽化
			(_1st_ShadeColor_Step - _1st_ShadeColor_Feather)
		)
		* 
		-1.0
		/
		_1st_ShadeColor_Feather;
	shadowValue = clamp(shadowValue, 0.0, 1.0);

	finalColor.rgb = lerp3(baseColor.rgb, shadowColorTexture.rgb, shadowValue );
	// float v = lerp(0.5, 0.0, shadowValue);
	// finalColor.rgb = vec3(v, v, v);
	// finalColor.rgb = shadowColorTexture.rgb;

	
	//==========================================
	// 计算光照：高光
	//------------------------------------------
	
	// 属性参数--高光--颜色
	vec3 _HighColor = vec3(0.1, 0.1, 0.1);
	// 属性参数--高光--材质强度
	float _HighColor_Power = 10.0;
	
	// 属性参数--高光2--颜色
	vec3 _HighColor2 = vec3(0.5, 0.4, 0.3);
	// 属性参数--高光2--强度
	float _HighColor_Power2 = 10.0;

	// _HighColor.rgb =  vec3(1.0, 0.0, 0.0);
	// _HighColor2.rgb = vec3(0.0, 1.0, 0.0);


	

	// 反射因数
	float reflectiveFactor = max(0.0, dot(worldNormal, halfLightViewDir));

	
	float heightPower = heightRimLightTexture.r;
	float powerTexVal = heightPower;
	powerTexVal = powerTexVal * 4.0;
	powerTexVal += 1.0;
	powerTexVal = pow(powerTexVal, powerTexVal);
	_HighColor_Power *= powerTexVal;


	// 镜面反射因数
	float specularFactor = pow(reflectiveFactor, _HighColor_Power);
	specularFactor *= step(0.001, heightPower);


	// 镜面反射因数
	float specularFactor2 = pow(reflectiveFactor, _HighColor_Power2);


	float heightMask2TexVal = heightRimLightTexture.g;
	specularFactor2 *= heightMask2TexVal;
	


	vec3 specularColor = specularFactor * _HighColor.rgb + specularFactor2 * _HighColor2.rgb;

	finalColor.rgb += specularColor;

	
	//==========================================
	// 边缘光
	//------------------------------------------

	// 属性参数--边缘光--颜色
	vec3 _RimLightColor = vec3(0.41, 0.25, 0.25);
	// 属性参数--边缘光--值
	float _RimLightValue = 4.0;
	// 属性参数--边缘光--强度
	float _RimLight_Power = 0.702;
	// 属性参数--边缘光--内边界
	float _RimLight_InsideMask = 0.427;
	// 属性参数--边缘光--遮罩值
	float _Tweak_RimLightMaskLevel = -0.45;

	// 边缘光颜色 = 边缘光颜色 * 主颜色 * 边缘光亮度值
	vec3 rimLightColor = _RimLightColor * baseColor.rgb * _RimLightValue;

	
	// 边缘光 光照值 = 1 - dot(法线, 摄像机方向)
	float rimArea = 1.0 - max(0.0, dot(worldNormal, worldViewDir) );
	
	// 边缘光 光照值, 强度处理
	float rimLightValue = pow(rimArea, exp2(lerp(3.0, 0.0, _RimLight_Power))  );
	// 边缘光 内边界
	float rimLightInsideMaskValue = clamp
	 					(
							// 强度 - 内边界
							(rimLightValue - _RimLight_InsideMask)
							/ 
							// 1 - 内边界
							(1.0 - _RimLight_InsideMask)
						, 0.0, 1.0);

	// 边缘光颜色， 处理过内边界后的， 边缘光颜色 * 边缘光内边界da
	rimLightColor = rimLightColor * rimLightInsideMaskValue;

	
	// 边缘光 最后颜色值
	rimLightColor *= clamp(heightRimLightTexture.b + _Tweak_RimLightMaskLevel * step(0.01, heightRimLightTexture.b), 0.0, 1.0);

	
	finalColor.rgb += rimLightColor;
	// finalColor.rgb = rimLightColor;


	// angle = dot(worldLightDir, worldNormal);
	// float v = rimArea;
	// finalColor.rgb = vec3(v, v, v);
	// finalColor.rgb = worldNormal;

	
	// #ifdef SHADOWTEXTURE
	// 	_ShadowStrength = 0.358;
	// 	// 灯光投影
	// 	finalColor.rgb -= stepValue * (1.0 - shadowTexture.b) *  _ShadowStrength  * shadowTexture.g;
		
	// 	// 画的褶皱阴影
	// 	finalColor.rgb -= (1.0 - stepValue) * shadowTexture.r * _ShadowStrength * shadowTexture.g;
	// #else
	// 	_ShadowStrength = 0.1;
	// 	// 灯光投影
	// 	finalColor.rgb -= stepValue *  _ShadowStrength;
	// #endif
	
	
	// // 场景光照贴图
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

