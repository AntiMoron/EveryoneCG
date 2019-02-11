import { Buffer } from './buffer'

export class VertexBuffer extends Buffer {
    /**
     *
     * @param {glContext} ctx
     * @param {number[]} positions
     * @param {number} positionComponentCount
     * @param {number[]} texcoords
     * @param {number} texcoordComponentCount
     */
    constructor(ctx, positions, positionComponentCount,
        texcoords, texcoordComponentCount) {
        super(ctx);
        const gl = ctx;
        // 先绑定顶点数据
        this._positionComponentCount = positionComponentCount;
        this._vertexCount = positions.length / positionComponentCount;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._raw);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);
        // 创建纹理用的buffer
        if (texcoords) {
            this._texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
            this._texcoordComponentCount = texcoordComponentCount;
        }
    }
    /**
     * 纹理buffer
     */
    _texBuffer = null;

    /**
     * 返回顶点个数
     */
    get vertexCount() {
        return this._vertexCount;
    }
    /**
     * 返回每个顶点的float个数
     */
    get positionComponentCount() {
        return this._positionComponentCount;
    }
    /**
     * 拿到纹理每个数据里float个数
     */
    get texcoordComponentCount() {
        return this._texcoordComponentCount;
    }
    /**
     * 返回纹理坐标buffer
     */
    get texcoordBuffer() {
        return this._texBuffer;
    }
}