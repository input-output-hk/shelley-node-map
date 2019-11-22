varying vec2 vUv;

uniform sampler2D uMousePosTexture;
uniform vec2 uMousePos;

void main() {
    vec4 mousePosTexture = texture2D(uMousePosTexture, vUv);

    float puvToMouse = distance(uMousePos, vUv);

    float grey = 0.0;
    float mouseRadius = 0.35;

    if (puvToMouse < mouseRadius) {
        grey = pow(1.0-puvToMouse * 1.0, 125.0) ;
    }

    float decay = 0.98;
    vec4 color = vec4(grey, grey, grey, 1.0);
    color += mousePosTexture * decay;

    gl_FragColor = color;
}