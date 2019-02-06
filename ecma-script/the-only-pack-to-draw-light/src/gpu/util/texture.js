import { GlBase } from './base';

export class Texture extends GlBase {
    /**
     * 创建一个纹理
     * @param {*} ctx glContext
     * @param {*} width 宽度
     * @param {*} height 高度
     */
    constructor(ctx, width = 1, height = 1) {
        super(ctx);
        this._width = width;
        this._height = height;
        const gl = ctx;
        this._raw = gl.createTexture();
        if (!this._raw) {
            throw 'Texture create failure.';
        }

        gl.bindTexture(gl.TEXTURE_2D, this._raw);
        // 创建一个纹理
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            width, height, border, srcFormat, srcType,
            null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}
