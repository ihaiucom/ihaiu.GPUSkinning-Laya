precision highp float;

#include "Lighting.glsl";
#include "GPUSkinningInclude.glsl";
//==============================================
// attribute 顶点属性
//----------------------------------------------

attribute vec4 a_Position;
attribute vec2 a_Texcoord0;
attribute vec4 a_Texcoord1;
attribute vec4 a_Texcoord2;

//==============================================
// uniform 全局变量
//----------------------------------------------

// 世界矩阵
#ifdef GPU_INSTANCE
	attribute mat4 a_WorldMat;
#else
	uniform mat4 u_WorldMat;
#endif


// 描边粗细
uniform float u_CartoonOutlineWidth;

// 世界坐标
varying vec3 v_PositionWorld;



// MVP (模型-摄像机-屏幕)矩阵
#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif


#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	// 顶点法线
	attribute vec3 a_Normal;
	varying vec3 v_Normal; 
	// 摄像机坐标
	uniform vec3 u_CameraPos;
	// 视角方向
	varying vec3 v_ViewDir; 
#endif

// 主UV偏移
#ifdef TILINGOFFSET
	uniform vec4 u_TilingOffset;
#endif
// 主贴图UV坐标
varying vec2 v_Texcoord0;

// 顶点颜色
#ifdef COLOR
	attribute vec4 a_Color;
#endif
	varying vec4 v_Color;

// 主贴图
#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

// 高光和边缘光贴图
#ifdef HEIGHTRIMLIGHTTEXTURE
	uniform sampler2D u_HeightRimLightTexture;
#endif

uniform vec4 u_outlineColor;

//  主函数
void main() 
{
	// vec4 mainTexture =  vec4(0.5, 0.3, 0.3, 1.0);
	vec4 mainTexture = u_outlineColor;
	#ifdef ALBEDOTEXTURE
		mainTexture *= texture2D(u_AlbedoTexture, a_Texcoord0);
	#endif 
	
	// 高光和边缘光贴图
	vec4 heightRimLightTexture = vec4(1.0, 1.0, 1.0, 1.0);
	#ifdef HEIGHTRIMLIGHTTEXTURE
		heightRimLightTexture = texture2D(u_HeightRimLightTexture, a_Texcoord0);
	#endif 


	vec4 p = a_Position;
	p.rgb +=  a_Normal * 0.005 * 1.5 * heightRimLightTexture.g;
	vec4 position = skin(p, a_Texcoord1, a_Texcoord2);
	mat4 mm_scale = mat4(
		-1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);



	position = mm_scale * position;

	// 世界坐标
	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif
	


	//u_CartoonOutlineWidth = 0.1;
	
	
    
    // 模型坐标 转 屏幕裁剪坐标
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif
	// gl_Position.z += 0.0001 * (1.0 - heightRimLightTexture.g);
	// gl_Position.z += 0.0001;

	


    // 顶点颜色
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		// v_Color = a_Color;
	#endif

	v_Color.rgb = mainTexture.rgb;
	

	
	// 分身
	#ifdef IS_SPEARATION
		float separation = 0.5;
		v_Color.rgb = v_Color.rgb * (1.0- separation)  + vec3(separation, separation, separation);
	#endif


	
	v_PositionWorld=(worldMat*position).xyz;
	
	// // 视角方向
	// #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	// 	v_ViewDir=u_CameraPos-v_PositionWorld;
	// #endif

    // // 主贴图UV
	// #if defined(ALBEDOTEXTURE)
	// 	#ifdef TILINGOFFSET
	// 		v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
	// 	#else
	// 		v_Texcoord0=a_Texcoord0;
	// 	#endif
	// #endif
	

	gl_Position=remapGLPositionZ(gl_Position);
}