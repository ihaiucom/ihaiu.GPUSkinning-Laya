precision highp float;

#include "Lighting.glsl";

// #ifdef ALBEDOTEXTURE
// 	uniform sampler2D u_AlbedoTexture;
// 	varying vec2 v_Texcoord0;
// #endif


// #ifdef ALPHATEST
// 	uniform float u_AlphaTestValue;
// #endif


varying vec3 v_PositionWorld;


varying vec4 v_Color;


void main()
{
	
	// vec4 mainTexture = vec4(0.0, 0.0, 0.0, 1.0);
	// #ifdef ALBEDOTEXTURE
	// 	mainTexture = texture2D(u_AlbedoTexture, v_Texcoord0);
	// #endif 
	
	// 地面以下 抛弃
	// if(v_PositionWorld.y < 0.0)
	// {
	// 	discard;
	// }

	// float v = 0.0;
	// gl_FragColor = vec4(v, v, v, 1.0) ;
	// gl_FragColor = vec4(0.5, 0.3, 0.3, 1.0) ;
	// gl_FragColor = mainTexture;
	gl_FragColor = v_Color;
	
	
}

