
#include "Lighting.glsl";
attribute vec4 a_Position;

attribute vec4 a_Color;


uniform mat4 u_MvpMatrix;

varying vec4 v_Color;

void main() {
	vec4 position = a_Position;
    
	
	gl_Position = u_MvpMatrix * position;
    
	v_Color = a_Color;
	
	gl_Position=remapGLPositionZ(gl_Position);
}