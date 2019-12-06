#pragma glslify: applyQuaternionToVector = require('./applyQuaternionToVector');
// #pragma glslify: rotationMatrix = require('./rotationMatrix');

uniform float uTime;

attribute vec3 pickerColor;
attribute vec3 offset;
attribute float scale;
attribute vec4 quaternion;
attribute float id;
attribute float isSelected;

varying vec3 vPickerColor;

void main() {

	vPickerColor = pickerColor;

	#include <begin_vertex>

	// scale
	transformed.xyz *= scale;
	transformed.xyz = applyQuaternionToVector( quaternion, transformed.xyz );
	transformed.xyz += offset.xyz;


	#include <project_vertex>

}