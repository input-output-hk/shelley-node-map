
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform float uTime;
uniform float uAspect;
uniform float uIsMobile;

varying vec2 vPUv;
varying vec2 vUv;
varying vec4 vMousePosTexture;
varying float vCamDist;

void main() {

	vec2 uv = vUv * vec2(uAspect, 1.0);
	vec2 puv = vPUv;

	// pixel color
	vec4 color = texture2D(uTexture, puv);

	if (color.r + color.g + color.b < 0.01) {
		discard;
	}

	// greyscale
	float grey = color.r * 0.21 + color.g * 0.71 + color.b * 0.07;
	color = vec4(grey * 1.0, grey * 0.2, grey * 0.2, 1.0);

	//float noiseVal = snoise3(vec3(puv * 2.0, uTime * 0.2 ));

	// color.r *= max( 0.4, noiseVal );
	// color += noiseVal * 0.02;

	float border = 1.0;
	float radius = 0.5;
	if (uIsMobile == 1.0) {
		border = 1.0;
		radius = 0.6;
	}

	// float radius = 0.5 + (vCamDist * 0.005);
	// float radius = 0.5 + (1.0-(uTextureSize.x+uTextureSize.y) * 0.001);
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);
	if (uIsMobile == 1.0) {
		t *= 2.0;
	}

	color.a *= t;

	gl_FragColor = color;
	
}