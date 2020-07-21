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

// 世界坐标
varying vec3 v_PositionWorld;


#ifdef SCENELIGHTING
	// x: xmin, y: xlength, z: zmin, w:zlength 
	uniform vec4 u_SceneLightingSize;
	varying vec2 v_SceneLightingUV; 
	// uniform sampler2D u_SceneLightingTexture;
	// varying vec3 v_SceneLighting; 
#endif

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
	vec4 position = skin(a_Position, a_Texcoord1, a_Texcoord2);

	mat4 mm_scale = mat4(
		-1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	
	
	mat4 mm_rotationX = mat4(
		1.0, 0.0, -0.0, 0.0,
		0.0, 2.220446049250313e-16, -1.0, 0.0,
		0.0, 1.0, 2.220446049250313e-16, 0.0,
		0.0, 0.0, 0.0, 1.0
	);
	
	
	// mat4 mm_rotationY = mat4(
	// 	0.7071067690849304, 0.0, -0.7071067690849304, 0.0,
	// 	0.0, 1.0, 0.0, 0.0,
	// 	0.7071067690849304, 0.0, 0.7071067690849304, 0.0,
	// 	0.0, 0.0, 0.0, 1.0
	// );
	
	mat4 mm_rotationY20 = mat4(
  0.9396926164627075
, 0.0
, -0.3420201539993286
, 0.0
, 0.0
, 1.0
, 0.0
, 0.0
, 0.3420201539993286
, 0.0
, 0.9396926164627075
, 0.0
, 0.0
, 0.0
, 0.0
, 1.0
	);

	position = mm_scale * position;
	
    
    // 模型坐标 转 屏幕裁剪坐标
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif

	


    // 顶点颜色
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
	#endif

	// 世界坐标
	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif

	
	// mat4 worldInvMat = worldMat*skinTransform;
	// mat3 worldInvMat = inverse(mat3(worldMat));
	
	mat3 worldInvMat = inverse(mat3(worldMat * mm_scale *skinTransform ));
	
	v_Normal=normalize(a_Normal*worldInvMat);

	// v_Normal = a_Normal * worldInvMat;
	// v_Normal = (  (vec4(a_Normal, 1.0) * worldInvMat) ).rgb;
	// v_Normal = (  (vec4(a_Normal, 1.0) * u_WorldMat) ).rgb;
	// v_Normal = ( worldMat * (mm_scale *mm_rotationY20 * mm_rotationX *  vec4(a_Normal, 0.0))  ).rgb;
	// v_Normal = (  worldMat  * (mm_scale *mm_rotationY20 * mm_rotationX *  vec4(a_Normal, 0.0))  ).rgb  ;
	// v_Normal = ( worldMat * skinTransform * (  vec4(a_Normal, 0.0))  ).rgb  ;

	v_PositionWorld=(worldMat*position).xyz;


	
	// 视角方向
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		v_ViewDir=u_CameraPos-v_PositionWorld;
	#endif
	

    // 主贴图UV
	#if defined(ALBEDOTEXTURE)
		#ifdef TILINGOFFSET
			v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
		#else
			v_Texcoord0=a_Texcoord0;
		#endif
	#endif
	

	#ifdef SCENELIGHTING
		vec2 positionWorldUV = vec2(0.0, 0.0);
		positionWorldUV.x = (v_PositionWorld.x - u_SceneLightingSize.x)/ u_SceneLightingSize.y;
		positionWorldUV.y = (v_PositionWorld.z - u_SceneLightingSize.z)/ u_SceneLightingSize.w;
		v_SceneLightingUV = positionWorldUV;
		// v_SceneLighting = texture2D(u_SceneLightingTexture, positionWorldUV).rgb;
	#endif

	gl_Position=remapGLPositionZ(gl_Position);
}