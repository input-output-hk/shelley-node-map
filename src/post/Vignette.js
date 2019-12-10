/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

const Vignette = {

  uniforms: {

    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.3 }

  },

  vertexShader: `

    varying vec2 vUv;

    void main() {

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }

  `,

  fragmentShader: `

    uniform float offset;
    uniform float darkness;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    float random(vec2 co){
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    // based on https://www.shadertoy.com/view/MslGR8
    vec3 dithering( vec3 color ) {
        //Calculate grid position
        float grid_position = random( gl_FragCoord.xy );
        //Shift the individual colors differently, thus making it even harder to see the dithering pattern
        vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
        //modify shift acording to grid position.
        dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
        //shift the color by dither_shift
        return color + dither_shift_RGB;
    }

    void main() {

        // Eskils vignette

    vec4 texel = texture2D( tDiffuse, vUv );
    vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );
    gl_FragColor = vec4( dithering( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ) ), texel.a );

        /*
        // alternative version from glfx.js
        // this one makes more "dusty" look (as opposed to "burned")

        "vec4 color = texture2D( tDiffuse, vUv );",
        "float dist = distance( vUv, vec2( 0.5 ) );",
        "color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
        "gl_FragColor = color;",
        */

    }

  `

}

export default Vignette
