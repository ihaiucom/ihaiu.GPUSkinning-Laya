
#ifdef HIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";

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

#include "ShadowHelper.glsl"
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
	//gl_FragColor=vec4(v_posViewZ,0.0,0.0,1.0);
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
		// main_castShadow();
	#else
		main_normal();
	#endif  
}
