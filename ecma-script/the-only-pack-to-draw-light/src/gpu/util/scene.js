import { GlBase } from './base'
import { Program } from './program';
import { VERT_POS, VERT_TEX } from './program';
import { Texture } from './texture';
import { VertexBuffer } from './vertex-buffer';
/**
 * 场景
 */
export class Scene extends GlBase {
    constructor(ctx) {
        super(ctx);
    }

    /**
     * 创建个gl程序
     * @param {string} vert 顶点着色器源码
     * @param {string} frag 片段着色器源码
     * @param {string[]} attributeNames 结构名 有要求自己记得第几个是做什么用的
     * @param {string[]} uniformNames 常量名 有要求自己记得第几个是做什么用的
     */
    createGlProgram(vert, frag,
        attributeNames, uniformNames) {
        return new Program(this._gl, vert, frag, attributeNames, uniformNames);
    }
    /**
     * 创建顶点数据
     * @param {number[]} positions
     * @param {number} positionComponentCount 顶点包含float个数
     * @param {number[]} texcoords 纹理坐标
     * @param {number} texcoordComponentCount 每个顶点包含float个数
     */
    createVertices(positions, positionComponentCount,
        texcoords = null, texcoordComponentCount = null) {
        return new VertexBuffer(this._gl, positions,
            positionComponentCount, texcoords, texcoordComponentCount);
    }

    clear() {
        const gl = this._gl;
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * 绑定顶点数据
     * @param {VertexBuffer} vertices 顶点数据
     */
    bindVertices(vertices) {
        const gl = this._gl;
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from
        //开启对应VAO并绑定顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices.raw);
        const positionSlot = this._currentProgram.structure.attribLocations.get(VERT_POS);
        gl.vertexAttribPointer(positionSlot,
            vertices.positionComponentCount,
            type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionSlot);
        // 绑定纹理坐标buffer
        const texSlot = this._currentProgram.structure.attribLocations.get(VERT_TEX);
        if (texSlot !== null && texSlot !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertices.texcoordBuffer);
            gl.vertexAttribPointer(texSlot, vertices.texcoordComponentCount, type, true, stride, offset);
            gl.enableVertexAttribArray(texSlot);
        }
    }
    /**
     * 绑定gl program
     * @param {Program} program 一个program
     * @param {[number, number]} textureSize
     * @param {Map<string, any>} otherParam
     */
    bindProgram(program, textureSize = null, otherParam = null) {
        this._gl.useProgram(program.raw);
        this._currentProgram = program;
        if (textureSize && textureSize.length >= 2 && program.structure.uniformLocations.get(SHADER_TEXTURESIZE)) {
            this._gl.uniform2f(program.structure.uniformLocations.get(SHADER_TEXTURESIZE), textureSize[0], textureSize[1])
        }
        if (otherParam) {
            for (const key in otherParam) {
                const v = otherParam[key];
                let isInteger = false;
                if (key.charAt(0) === 'i') {
                    isInteger = true;
                }
                if (program.structure.uniformLocations.get(key)) {
                    if (typeof v === 'number') {
                        if (isInteger) {
                            this._gl.uniform1i(program.structure.uniformLocations.get(key), v);
                        } else {
                            this._gl.uniform1f(program.structure.uniformLocations.get(key), v);
                        }
                    } else if (typeof v === 'object' && Object.prototype.toString.call(v) === '[object Array]') {
                        if (isInteger) {
                            this._gl.uniform1iv(program.structure.uniformLocations.get(key), new Int32Array(v));
                        } else {
                            this._gl.uniform1fv(program.structure.uniformLocations.get(key), new Float32Array(v));
                        }
                    }
                }
            }
        }
    }

    /**
     * 创建frame buffer.
     * @param {number} width 宽
     * @param {number} height 高
     */
    createFrameBuffer(width, height) {
        return new FrameBuffer(this._gl, width, height);
    }
    /**
     * 绑定一帧
     * @param {FrameBuffer} framebuffer 一帧缓存
     */
    bindFrameBuffer(framebuffer) {
        const gl = this._gl;
        if (!framebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return;
        }
        framebuffer.use();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    /**
     * 创建纹理
     * @param {number} width 宽
     * @param {number} height 高
     */
    createTexture(width = 1, height = 1) {
        return new Texture(this._gl, width, height);
    }
    // /**
    //  * 根据canvas创建纹理
    //  * @param canvas canvas
    //  */
    // createTextureFromCanvas(canvas) {
    //     return new Texture(this._gl, canvas);
    // }
    /**
     * 绑定的纹理
     * @param {Texture} tex 绑定的纹理
     * @param {string} uniformName 绑定uniform位置
     */
    bindTexture(tex, uniformName = null) {
        const gl = this._gl;
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(uniformName === SAMPLER2 ? gl.TEXTURE1 : gl.TEXTURE0);
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, tex.raw);
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(this._currentProgram.structure.uniformLocations.get(uniformName ? uniformName : SAMPLER),
            uniformName === SAMPLER2 ? 1 : 0);
    }

    /**
     * 绘制一个顶点buffer
     * @param {VertexBuffer} vertices 绘制一个顶点buffer
     * @param {string} primitiveType 原节点
     */
    draw(vertices, primitiveType) {
        this.bindVertices(vertices);
        const gl = this._gl;
        let glPrimitiveType = null;
        switch (primitiveType) {
            case 'line':
                glPrimitiveType = gl.LINES;
                break;
            case 'linestrip':
                glPrimitiveType = gl.LINE_STRIP;
                break;
            case 'triangle':
                glPrimitiveType = gl.TRIANGLES;
                break;
            case 'trianglestrip':
                glPrimitiveType = gl.TRIANGLE_STRIP;
                break;
            default: break;
        }
        gl.drawArrays(glPrimitiveType, 0, vertices.vertexCount);
    }

    getError() {
        return this._gl.getError();
    }
}