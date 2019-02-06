/**
 * @author antimoron
 */
export default `
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision highp float;

void main(void) {
  // gl_FragColor = vec4(1,0,0,1);
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;