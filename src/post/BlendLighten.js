import {
  Color
} from 'three'

const BlendLighten = {
  uniforms: {
    'tDiffuse': { value: null },
    'brightness': { value: 0.18 },
    'contrast': { value: 0.35 },
    'blendColor': { value: new Color(0x000000) }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: `

    float blendLighten(float base, float blend) {
      return max(blend,base);
    }

    vec3 blendLighten(vec3 base, vec3 blend) {
      return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
    }

    vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
      return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
    }

    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform vec3 blendColor;

    varying vec2 vUv;

    void main() {

      //vec3 bgColor = vec3(18. / 255., 19. / 255., 38. / 255.);
      vec3 bgColor = blendColor;

      gl_FragColor = texture2D( tDiffuse, vUv );

      gl_FragColor.rgb += brightness;

      if (contrast > 0.0) {
        gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;
      } else {
        gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;
      }

      vec3 color = blendLighten(bgColor.rgb, gl_FragColor.rgb);

      gl_FragColor.rgb = color;

    }

  `

}

export default BlendLighten
