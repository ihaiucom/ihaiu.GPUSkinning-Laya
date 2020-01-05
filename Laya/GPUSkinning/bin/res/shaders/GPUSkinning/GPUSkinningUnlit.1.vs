
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

	uniform sampler2D u_AlbedoTexture;

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



vec3 mul(mat4 m, vec3 v)
{
	vec3 r;
	r.x = m[0].x * v.x + m[0].y * v.y + m[0].z * v.z + m[0].w;
	r.y = m[1].x * v.x + m[1].y * v.y + m[1].z * v.z + m[1].w;
	r.y = m[2].x * v.x + m[2].y * v.y + m[2].z * v.z + m[2].w;

	return r;
}



vec3 mul_(mat4 m, vec3 v)
{
	vec3 r;
	r.x = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w;
	r.y = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w;
	r.y = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w;

	return r;
}


vec3 mul2(mat4 m, vec3 v)
{
	vec3 r;
	r.x = m[0].x * v.x + m[0].y * v.y + m[0].z * v.z + m[0].w;
	r.y = m[1].x * v.x + m[1].y * v.y + m[1].z * v.z + m[1].w;
	r.y = m[2].x * v.x + m[2].y * v.y + m[2].z * v.z + m[2].w;

	float num = 1.0 / (m[3].x * v.x +  m[3].y * v.y + m[3].z * v.z + m[3].w);
	r.x *= num;
	r.y *= num;
	r.z *= num;
	return r;
}

vec4 mul4(mat4 m, vec4 v)
{
	vec4 r;
	r.x = m[0].x * v.x + -m[0].y * v.y + -m[0].z * v.z + -m[0].w * v.w;
	r.y = -m[1].x * v.x + m[1].y * v.y + m[1].z * v.z + m[1].w * v.w;
	r.y = -m[2].x * v.x + m[2].y * v.y + m[2].z * v.z + m[2].w * v.w;
	r.w = -m[3].x * v.x + m[3].y * v.y + m[3].z * v.z + m[3].w * v.w;
	return r;
}

vec4 mul42(mat4 m, vec4 v)
{
	vec4 r;
	r.x = m[0].x * v.x + m[0].y * v.y + m[0].z * v.z + m[0].w * v.w;
	r.y = m[1].x * v.x + m[1].y * v.y + m[1].z * v.z + m[1].w * v.w;
	r.y = m[2].x * v.x + m[2].y * v.y + m[2].z * v.z + m[2].w * v.w;
	r.w = m[3].x * v.x + m[3].y * v.y + m[3].z * v.z + m[3].w * v.w;
	return r;
}

vec4 lmul4(mat4 m, vec4 v)
{
	vec4 r;
	r.x = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	r.y = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	r.y = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	r.w = m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	return r;
}



vec4 lmul2(mat4 m, vec4 v)
{
	vec4 r;
	r.x = m[0].x * v.x + -m[1].y * v.y + -m[2].z * v.z + m[3].w * v.w;
	r.y = -m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	r.y = -m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	r.w = -m[0].x * v.x + m[1].y * v.y + m[2].z * v.z + m[3].w * v.w;
	return r;
}

float colorToFoat(vec4 c)
{
	return (c.x * 10000.0 + c.y * 100.0 + c.z) * (c.w * 10.0 - 1.0);
}

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

	// mat4 m = getMatrix(int(a_Texcoord1.x));
	// position = a_Position;
	// position = m * position ;
	
	//position = a_Position;
	

	
	
	//position = mul42(r, position) ;
	//position.xyz = mul2(u_MvpMatrix, position.xyz) ;
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