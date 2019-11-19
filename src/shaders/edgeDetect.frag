#extension GL_OES_standard_derivatives : enable

// #pragma glslify: blend = require(glsl-blend/overlay)
// #pragma glslify: edgeDetect = require(glsl-edge-detection)

uniform sampler2D uTexture;
varying vec2 vUv;

void main() {

  // fast edge detection https://www.shadertoy.com/view/MdGGRt
  vec4 o = vec4(1.0);

  float edgeThreshold = 50.0;

  o -= o - length(fwidth(texture2D(uTexture, vUv))) * edgeThreshold;

  gl_FragColor = 1.0 - o;
}