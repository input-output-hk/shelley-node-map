
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vPUv;
varying vec2 vUv;

void main() {

	vec2 uv = vUv;
	vec2 puv = vPUv;

	// pixel color
	vec4 color = texture2D(uTexture, puv);

	if (color.r + color.g + color.b < 0.01) {
		discard;
	}

	// greyscale
	float grey = color.r * 0.21 + color.g * 0.71 + color.b * 0.07;
	color = vec4(grey * 1.5, 0.0, 0.0, 1.0);

	float noiseVal = snoise3(vec3(puv * 2.0, uTime * 0.2 ));

	color.r *= max( 0.4, noiseVal );
	color += noiseVal * 0.02;

	float border = 0.9;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);

	color.a *= t;

	gl_FragColor = color;

	float contrast = 3.0;
	float brightness = 0.1;

	vec3 colorContrasted = color.rgb * contrast;
	vec3 bright = colorContrasted + vec3(brightness, brightness, brightness);
	gl_FragColor.rgb = bright;

}