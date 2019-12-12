#pragma glslify: applyQuaternionToVector = require('./applyQuaternionToVector');
#pragma glslify: rotationMatrix = require('./rotationMatrix');

uniform float uTime;

attribute vec3 offset;
attribute float scale;
attribute vec4 quaternion;
attribute float id;
attribute float isSelected;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>

	#ifdef USE_ENVMAP

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	#endif

	#include <begin_vertex>

	// scale
	transformed.xyz *= scale;

	mat4 rotation = rotationMatrix(offset.xyz * vec3(0.0, 0.0, 1.0), (id + uTime * 1.5));
	vec4 newPos = rotation * vec4( transformed, 1.0 );

	transformed.xyz = newPos.xyz;
	transformed.xyz = applyQuaternionToVector( quaternion, transformed.xyz );
	transformed.xyz += offset.xyz;

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>

	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

}
