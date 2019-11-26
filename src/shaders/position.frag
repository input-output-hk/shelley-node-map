#pragma glslify: curlNoise = require('./curlNoise');

varying vec2 vUv;

uniform sampler2D positionTexture;
uniform sampler2D defaultPositionTexture;
uniform float uFrame;
uniform float uNoiseMix;

void main() {
  vec4 defaultPosition = texture2D(defaultPositionTexture, vUv);
  vec4 currentPosition = texture2D(positionTexture, vUv);

  float kernelSize = 0.03;
  vec3 scaledPosition = vec3(currentPosition.x, currentPosition.y, sin(uFrame * 0.001) * 100.0) * kernelSize;

  float noiseSpeed = 0.4;

  currentPosition.xyz = currentPosition.xyz + (curlNoise(scaledPosition) ) * noiseSpeed;

  currentPosition = mix(defaultPosition, currentPosition, uNoiseMix * 0.95);

  gl_FragColor = currentPosition;

}