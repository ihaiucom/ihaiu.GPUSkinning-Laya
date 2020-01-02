#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

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

varying vec4 v_Texcoord1;

//  主函数
void main() 
{
	vec4 position ;

	// position = a_Texcoord2;

	// #ifdef SKIN_1
    //     position= skin1(a_Position, a_Texcoord1, a_Texcoord2);
	// #endif

    
	// #ifdef SKIN_2
    //     position= skin2(a_Position, a_Texcoord1, a_Texcoord2);
	// #endif

	// #ifdef SKIN_4
    //     position= skin4(a_Position, a_Texcoord1, a_Texcoord2);
	// #endif

	position= skin4(a_Position, a_Texcoord1, a_Texcoord2);

	//position.x *= u_GPUSkinning_FrameIndex_PixelSegmentation.z * 0.0001;

	// position = a_Position;
	// position.x += a_Texcoord2.x ;

v_Texcoord1 = a_Texcoord1;
    
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