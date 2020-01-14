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
attribute vec4 a_Color;

//==============================================
// uniform 全局变量
//----------------------------------------------

// MVP (模型-摄像机-屏幕)矩阵
#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif


//==============================================
// varying 传递给像素片段处理器属性
//----------------------------------------------

// 主贴图UV坐标
varying vec2 v_Texcoord0;
varying vec4 v_Color;


//  主函数
void main() 
{
	vec4 position = skin(a_Position, a_Texcoord1, a_Texcoord2);
	mat4 mm = mat4(
		-1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	position = mm * position;
	
    
    // 模型坐标 转 屏幕裁剪坐标
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif

    // 主贴图UV
    v_Texcoord0 = a_Texcoord0;

    
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
	#endif

	gl_Position=remapGLPositionZ(gl_Position);
}