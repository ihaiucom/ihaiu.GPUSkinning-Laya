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



// 场景--灯光贴图
#ifdef SCENELIGHTING
	// varying vec3 v_SceneLighting; 
	uniform sampler2D u_SceneLightingTexture;
	varying vec2 v_SceneLightingUV; 
#endif



// 场景--色彩平衡
#ifdef SCENECOLORBALANCE
	uniform vec3 u_SceneColorBalance; 
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




// 高光 - 强度
uniform float u_Specular;
// 高光 - 高斯
uniform float u_SpecGloss;
// 高光 - 颜色
uniform vec4 u_SpecColor;
// 高光 - 方向
uniform vec4 u_SpecularSpaceLightDir;


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



// 获取颜色亮度
float getLuminance(vec3 c)
{
	float p = lerp(c.b,  c.g,  step( c.b, c.g ));
	float q = lerp(p, c.r, step( p, c.r ) );
	return q;

	// float _max = max(c.r, max(c.g, c.b));
	// float _min = min(c.r, min(c.g, c.b));
	// return (_max + _min) * 0.5;
}

vec3 RGBToHSV(vec3 c)
{
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = lerp4( vec4( c.bg, K.wz ), vec4( c.gb, K.xy ), step( c.b, c.g ) );
	vec4 q = lerp4( vec4( p.xyw, c.r ), vec4( c.r, p.yzx ), step( p.x, c.r ) );
	float d = q.x - min(q.w, q.y);
	float e = 0.01;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 HSVToRGB(vec3 c)
{
	vec4 K = vec4( 1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0 );
	vec3 p = abs( fract( c.xxx + K.xyz ) * 6.0 - K.www );
	return c.z * lerp3( K.xxx, clamp ( p - K.xxx, 0.0, 1.0 ), c.y );
}

// 色彩平衡
vec3 colorBalance(vec3 c, vec3 balanceValue)
{
	float l = getLuminance(c);
	// vec3 hsv = RGBToHSV(c);
	// float l = hsv.z;

	float dark = 0.0;
	float height = 0.0;
	// float mrange = (height - dark) * 0.5;
	// float mid = mrange + dark;
	// float diff = mid - l;
	// diff = abs(diff);
	// float f = 1.0 - (diff + 0.01) / (mrange + 0.01);
	// // vec3 value = c.rgb + balanceValue * f;
	// vec3 value = c.rgb + balanceValue * f;
	// return max(min(value, vec3(1.0, 1.0, 1.0)), vec3(0.0, 0.0, 0.0));

	// float ii = 1.0/ 255.0;
	//  return c.rgb + balanceValue * ((1.0 -l + ii) / ii);

	// float ii = 1.0/ 255.0;
	// vec3 value = c.rgb + balanceValue * ((l - height + ii) / (1.0 - height + ii));

	
	vec3 value = c.rgb + balanceValue * (l - height);
	
	vec3 hsv2 = RGBToHSV(value);
	hsv2.z= l;
	value = HSVToRGB(hsv2);
	return value;

}

void main()
{
	
	vec4 mainTexture = u_AlbedoColor;
	#ifdef ALBEDOTEXTURE
		mainTexture = texture2D(u_AlbedoTexture, v_Texcoord0);
	#endif 


	
	// #ifdef ALPHATEST
	// 	if(mainTexture.a < u_AlphaTestValue)
	// 		discard;
	// #endif
	

	// 地面以下 抛弃
	// if(v_PositionWorld.y < 0.5)
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

	// 世界法线
	vec3 worldNormal = normalize(v_Normal);
	// 世界视角
	vec3 worldViewDir= normalize(v_ViewDir);
	


	// 基本色
	vec4 baseColor = mainTexture * u_AlbedoColor;
	vec4 finalColor = baseColor;
	
	// 场景--色彩平衡
	#ifdef SCENECOLORBALANCE
		finalColor.rgb = colorBalance(finalColor.rgb, u_SceneColorBalance);
	#endif

	// 高光
	// worldViewDir.z = worldViewDir.z * -1.0;
	// vec3 specular = normalize(reflect(worldViewDir, worldNormal));
	vec3 specular = normalize(reflect(u_SpecularSpaceLightDir.rgb, worldNormal));
	float specularVal = pow(clamp(dot(specular, worldViewDir), 0.0, 1.0), u_SpecGloss);
	specularVal *=  mainTexture.a;
	specularVal *=  u_Specular;
	specular = u_SpecColor.rgb * specularVal ;
	finalColor.rgb += specular;
	// finalColor.rgb = specular;
	// mainTexture.a = clamp(mainTexture.a * 10.0, 0.0, 1.0);
	
	// finalColor = vec4(mainTexture.a, mainTexture.a, mainTexture.a, mainTexture.a);
	// finalColor.rgb = finalColor.rgb + mainTexture.a;
	// finalColor = vec4(specularVal, specularVal, specularVal, specularVal);






	// 受击
	float dotNV = dot(worldNormal, worldViewDir);
	dotNV = max(0.0, dotNV);
	finalColor.rgb = finalColor.rgb + u_DotRimColor.rgb * u_DotRimColor.a  * dotNV ;


	// 无敌
	#ifdef IS_INVINCIBLE
		float dotSuperarmor = dot(worldNormal, worldViewDir);
		dotSuperarmor = 1.0 - dotSuperarmor;
		dotSuperarmor = pow(dotSuperarmor, 1.5);
		dotSuperarmor = max(0.0, dotSuperarmor);
		vec3 superarmorColorA = vec3(1.0, 1.0, 1.0);
		finalColor.rgb = baseColor.rgb  + superarmorColorA * dotSuperarmor * 1.0  ;
	#endif
	
	

	
	// 霸体
	#ifdef IS_SUPERARMOR
		float dotSuperarmor = dot(worldNormal, worldViewDir);
		dotSuperarmor = max(0.0, dotSuperarmor);
		vec3 superarmorColorA = vec3(1.0, 1.0, 0.0);
		finalColor.rgb = finalColor.rgb  + superarmorColorA * (1.0 - dotSuperarmor) * 0.8  ;
	#endif


	// 分身
	#ifdef IS_SPEARATION
		vec3 superarmorColorA = vec3(1.0, 1.0, 1.0);
		finalColor.rgb = mainTexture.rgb * 0.5 + superarmorColorA * 0.5;
	#endif
	

	// 尸体
	#ifdef IS_DIE
		finalColor.rgb = vec3(finalColor.r * 0.5, finalColor.g * 0.5, finalColor.b * 0.5);
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

