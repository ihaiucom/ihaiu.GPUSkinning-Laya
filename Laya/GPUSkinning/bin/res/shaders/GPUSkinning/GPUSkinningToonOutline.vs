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
	varying vec4 v_Color;
#endif




//  主函数
void main() 
{
	vec4 p = a_Position;
	p.rgb +=  a_Normal * 0.005;
	vec4 position = skin(p, a_Texcoord1, a_Texcoord2);
	mat4 mm = mat4(
		-1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);



	position = mm * position;

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
	gl_Position.z += 0.0001;


	


    // 顶点颜色
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
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