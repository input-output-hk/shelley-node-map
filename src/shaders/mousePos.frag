varying vec2 vUv;

uniform sampler2D uMousePosTexture;
uniform vec2 uMousePos;
uniform vec2 uPrevMousePos;
uniform float uAspect;

float distToSegment( vec2 x1, vec2 x2, vec2 p ) {

  vec2 v = x2 - x1;
  vec2 w = p - x1;

  float c1 = dot(w,v);
  float c2 = dot(v,v);

  float div = mix( c2, c1, step( c2, c1 ) );

  float mult = step( 0.0, c1 );

  float b = c1 * mult / div;
  vec2 pb = x1 + b*v;

  return distance( p, pb );

}

void main() {

    vec4 mousePosTexture = texture2D(uMousePosTexture, vUv);

    float mouseRadius = 0.35;

    float decay = 0.96;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    // vec2 correctedMousePos = uMousePos * vec2(uAspect, 1.0);

    float dist = distToSegment(uPrevMousePos * vec2(uAspect, 1.0), uMousePos  * vec2(uAspect, 1.0), vUv * vec2(uAspect, 1.0));

    if (dist < mouseRadius) {
        float mouse = pow(1.0-abs(dist) * 1.0, 125.0);
        color.b = mouse;

        vec2 dir = vec2((uMousePos * vec2(uAspect, 1.0)) - (uPrevMousePos * vec2(uAspect, 1.0) ) );
        color.xy = dir*0.5;
    }

    color += mousePosTexture * decay;

    gl_FragColor = color;
}