/**
 * @date 9102/02/04
 * @author antimoron
 */
export class GlBase {
    /**
     * 传入一个glContext
     * @param {glContext} glCtx
     */
    constructor(glCtx) {
        this._gl = glCtx;
    }

    get context() {
        return this._gl;
    }

    // 返回gl对象原始内容
    get raw() {
        return this._raw;
    }
}