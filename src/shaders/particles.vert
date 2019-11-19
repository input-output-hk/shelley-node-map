uniform vec2 uTextureSize;
uniform sampler2D uTexture;

attribute vec3 offset;

varying vec2 vUv;
varying vec2 vPUv;

void main() {

	 vUv = uv;

	// particle uv
	vec2 puv = offset.xy / uTextureSize;
	vPUv = puv;

	vec4 color = texture2D(uTexture, puv);

	if (color.r + color.g + color.b > 0.01) {

		#include <begin_vertex>
		#include <project_vertex>

		vec3 scaledOffset = vec3((offset.xy/uTextureSize-0.5), offset.z);

		mvPosition = modelViewMatrix * vec4(scaledOffset, 1.0);

		vec4 newPos = vec4(position, 0.);

		float scale = 0.006;
		newPos.xy *= scale;

		mvPosition.xyz += newPos.xyz;

		gl_Position = projectionMatrix * mvPosition;

	} else {

		gl_Position = vec4(99999.9);

	}
}
