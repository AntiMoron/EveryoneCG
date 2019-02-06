import { GlBase } from './base';
import { Shader } from './shader';

/**
 * 一堆slotname
 */
export const VERT_POS = 'aVertexPosition';
export const VERT_TEX = 'aTextureCoord';
export const CAM_PROJ = 'uProjectionMatrix';
export const CAM_MODEL = 'uModelViewMatrix';
export const SAMPLER = 'uSampler';
export const SAMPLER2 = 'uSampler2';
export const SHADER_TEXTURESIZE = 'uTextureSize';

export class Program extends GlBase {
    /**
     *
     * @param {*} ctx
     * @param {string} vert shader代码
     * @param {string} frag shader代码
     * @param {*} attributeNames attribute名字
     * @param {*} uniformNames uniform名字
     */
    constructor(ctx, vert, frag,
        attributeNames, uniformNames) {
        super(ctx);
        this._vert = new Shader(ctx, 'vert', vert);
        this._frag = new Shader(ctx, 'frag', frag);
        this._raw = ctx.createProgram();
        ctx.attachShader(this._raw, this._vert.raw);
        ctx.attachShader(this._raw, this._frag.raw);
        ctx.linkProgram(this._raw);
        const gl = ctx;
        // 如果程序链接阶段异常 则抛出报错
        if (!gl.getProgramParameter(this._raw, gl.LINK_STATUS)) {
            throw 'Unable to initialize the shader program: ' +
            gl.getProgramInfoLog(this._raw);
        }

        this._programStructure = {
            attribLocations: attributeNames.reduce((pre, attrName, _) => {
                pre.set(attrName, this._glContext.getAttribLocation(this._program, attrName));
                return pre;
            }, new Map()),
            uniformLocations: uniformNames.reduce((pre, unif, _) => {
                pre.set(unif, this._glContext.getUniformLocation(this._program, unif));
                return pre;
            }, new Map()),
        }
    }
    /**
     * 用当前program
     */
    use() {
        this._gl.useProgram(this.raw);
    }
    // 记录shader中绑定结构slot位置
    _programStructure = null;
    /**
     * 程序结构
     */
    get structure() {
        return this._programStructure;
    }
}