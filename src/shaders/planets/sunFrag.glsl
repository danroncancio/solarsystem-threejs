varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(1.0, 0.6, 0.0) * pow(intensity, 1.0);

    gl_FragColor = vec4(atmosphere + vec3(.7, .45, 0), 1.0);
}