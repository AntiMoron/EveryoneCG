import { GlBase } from './base'

export class Shader extends GlBase {
    /**
     * 创建一个webgl shader对象
     * @param {glContext} glCtx webgl context.
     * @param {string} type 'vert' | 'frag'
     * @param {string} source shader代码
     */
    constructor(glCtx, type, source) {
        super(glCtx);
        this._type = type;
        this._source = source;
        this._raw = this._loadShader();
    }

    _loadShader() {
        const {
            _type: type,
            _source: source,
        } = this;
        const gl = this.context;
        let shaderType = null;
        switch (type) {
            case 'vert':
                shaderType = gl.VERTEX_SHADER;
                break;
            case 'frag':
                shaderType = gl.FRAGMENT_SHADER;
                break;
            default:
                throw new Error('Not supported.');
        }
        if (!shaderType) {
            throw new Error('Not supported.');
        }
        const shaderId = gl.createShader(shaderType);
        if (!shaderId) {
            throw new Error('shader failed.');
        }
        gl.shaderSource(shaderId, source);
        gl.compileShader(shaderId);
        // 拿下编译结果，有问题抛
        if (!gl.getShaderParameter(shaderId, gl.COMPILE_STATUS)) {
            const errorLog = gl.getShaderInfoLog(shaderId);
            gl.deleteShader(shaderId);
            throw new Error('Shader compile failure: \n\n' + errorLog);
        }
        return shaderId;
    }
}