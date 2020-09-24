precision highp float;

uniform vec4 u_AlbedoColor;
varying vec4 v_Color;
void main()
{
    
	gl_FragColor = v_Color * u_AlbedoColor;
}