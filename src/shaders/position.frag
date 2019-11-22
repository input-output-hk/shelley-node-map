#pragma glslify: curlNoise = require('./curlNoise');

varying vec2 vUv;

uniform sampler2D positionTexture;
uniform sampler2D defaultPositionTexture;
uniform float uFrame;
uniform float uNoiseMix;

void main() {
  vec4 defaultPosition = texture2D(defaultPositionTexture, vUv);
  vec4 currentPosition = texture2D(positionTexture, vUv);

  // vec3 scaledPosition = vec3(currentPosition.x, currentPosition.y, currentPosition.z + (sin(uFrame * 0.001) * 1.0)) * 0.0000045;
  float kernelSize = 0.03;
  vec3 scaledPosition = vec3(currentPosition.x, currentPosition.y, currentPosition.z+(sin(uFrame))) * kernelSize;

  float noiseSpeed = 0.4;

  currentPosition.xyz = currentPosition.xyz + (curlNoise(scaledPosition) ) * noiseSpeed;

  // currentPosition.w -= 1.0;
  // if (currentPosition.w < 0.0 ) {
  //   currentPosition = defaultPosition;
  // }
  //currentPosition = defaultPosition;

  currentPosition = mix(defaultPosition, currentPosition, uNoiseMix);

  gl_FragColor = currentPosition;

}